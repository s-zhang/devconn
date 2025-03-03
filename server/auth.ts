import fs from "fs";
import "dotenv/config";
import { Database } from "sqlite";

// Define type for google client secret
interface GoogleClientSecret {
	web: {
		client_id: string;
		client_secret: string;
	};
}

// Read and parse the client secret file (ensure env var is defined)
const googleClientSecret: GoogleClientSecret = JSON.parse(
  fs.readFileSync(process.env.GOOGLE_CLIENT_SECRET_PATH as string, "utf-8")
);

export async function saveToken(db: Database<any>, token: any): Promise<void> {
  const expiresIn: number = token?.raw?.expires_in || 3599;
  const creationDate: number = Date.now();
  const expirationDate: number = creationDate + expiresIn * 1000;
  await db.run(
    `INSERT INTO secrets (key, value, creationDate, expirationDate) VALUES (?, ?, ?, ?)`,
    ['google_jwt', JSON.stringify(token), creationDate, expirationDate]
  );
}

export async function refreshToken(db: Database<any>, currentToken: any): Promise<any | null> {
  try {
    const { refresh_token } = currentToken;
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: googleClientSecret.web.client_id,
        client_secret: googleClientSecret.web.client_secret,
        refresh_token: refresh_token,
        grant_type: 'refresh_token',
      }),
    });
    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Failed to refresh token: ${responseText}`);
    }
    const newToken: any = await response.json();
    newToken.refresh_token = refresh_token;
    await saveToken(db, newToken);
    return newToken;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
}

export async function getToken(db: Database<any>): Promise<any | null> {
  const latestSecret = await db.get(
    `SELECT * FROM secrets WHERE key = 'google_jwt' ORDER BY creationDate DESC LIMIT 1`
  );
  return latestSecret ? JSON.parse(latestSecret.value) : null;
}

export async function initializeToken(db: Database<any>, refreshInterval: number, refresh: boolean): Promise<string | null> {
  const redirect = "/connect/google";
  if (refresh) {
    const latestSecret = await getToken(db);
    if (latestSecret) {
        const currentTime: number = Date.now();
        const timeToRefresh: number = latestSecret.expirationDate - currentTime - refreshInterval;
        if (timeToRefresh > 0) {
        return null;
        } else {
        const token = await refreshToken(db, latestSecret);
        return token === null ? redirect : null;
        }
    } else {
        return redirect;
    }
  } else {
    return null;
  }
}

export async function checkAndRefreshToken(db: Database<any>, interval: number): Promise<void> {
  const latestSecret = await getToken(db);
  if (latestSecret) {
    const currentTime: number = Date.now();
    const timeToExpire: number = latestSecret.expirationDate - currentTime;
    if (timeToExpire <= interval) {
      console.log('Token is about to expire, refreshing...');
      await refreshToken(db, latestSecret);
    }
  }
}
