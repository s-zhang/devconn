import express, { type Request, Response, NextFunction } from "express";
import session from 'express-session';
import fs from 'fs';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import grant from 'grant';
import initializeDatabase from "./db";
import { initializeToken, saveToken, getToken, checkAndRefreshToken } from './auth.ts';
import { google } from 'googleapis';

const refreshInterval = 5 * 60 * 1000; // 5 minutes
const googleClientSecret = JSON.parse(fs.readFileSync(process.env.GOOGLE_CLIENT_SECRET_PATH as string, "utf-8"));
const origin = process.env.ORIGIN || "http://localhost:5000";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

(async () => {
  const db = await initializeDatabase(app.get("env") === "production");
  const redirect = await initializeToken(db, refreshInterval, false);

  app.get('/api/gmail/unread-messages', async (req, res) => {
    try {
      const token = await getToken(db);
      const oauth2Client = new google.auth.OAuth2({
        clientId: googleClientSecret.web.client_id,
        clientSecret: googleClientSecret.web.client_secret
      })
      oauth2Client.setCredentials(token);
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread label:inbox',
        includeSpamTrash: false,
        maxResults: 20 // Limit to 20 messages
      });

      if (response.status !== 200) {
        res.status(response.status).send(response.data);
        return;
      }

      if (!response.data.messages) {
        res.json([]);
        return;
      }
      const messages = response.data.messages;
        
      // Get the From, To, CC, Bcc, Subject, Date, and Body of each message
      const messageDetails = await Promise.all(messages.map(async (message: any) => {
        const messageResponse = await gmail.users.messages.get({
          userId: 'me',
          id: message.id
        });
        const headers = (messageResponse as any).data.payload.headers;
        const getHeader = (name: any) => headers.find((header: any) => header.name === name)?.value || '';

        const from = getHeader('From');
        const to = getHeader('To');
        const cc = getHeader('Cc');
        const bcc = getHeader('Bcc');
        const subject = getHeader('Subject');
        const date = getHeader('Date');
        let body = '';
        const parts = (messageResponse as any).data.payload.parts;
        if (parts) {
          const textPart = parts.find((part: any) => part.mimeType === 'text/plain');
          if (textPart && textPart.body && textPart.body.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
          }
        }

        return {
          from,
          to,
          cc,
          bcc,
          subject,
          date,
          body
        };
      }));

      res.json(messageDetails);
    } catch (error) {
      console.error('Error listing Gmail threads:', error);
      res.status(500).json({ error: 'Failed to list Gmail threads' });
    }
  });

  app
    .use(session({secret: 'grant', saveUninitialized: true, resave: false}))
    .use(grant.express({
      "defaults": {
        "origin": origin,
        "transport": "session"
      },
      "google": {
        "key": googleClientSecret.web.client_id,
        "secret": googleClientSecret.web.client_secret,
        "callback": "/google",
        "custom_params": {
          "access_type": "offline",
          "prompt": "consent"
        },
        "scope": [
          'https://www.googleapis.com/auth/gmail.readonly',
          'https://www.googleapis.com/auth/gmail.send'
        ]
      }
    }))
    .get('/google', async (req, res) => {
      const token = (req.session as any).grant.response;
      await saveToken(db, token);
      res.redirect('/');
    });

  app.use((req, res, next) => {
    if (redirect) {
      res.redirect(redirect);
      return;
    }
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
