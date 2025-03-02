import TopNav from "@/components/navigation/top-nav";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome to the Interface
          </h1>
          <p className="text-gray-600 max-w-lg">
            This clean and modern interface features a Tools multiselect and 
            ChatGPT dropdown in the top-left corner. Explore the functionality
            using the navigation options above.
          </p>
        </div>
      </main>
    </div>
  );
}
