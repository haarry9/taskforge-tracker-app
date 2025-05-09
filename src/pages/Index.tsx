
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-medium">MyApp</h1>
          <nav>
            <ul className="flex gap-6">
              <li>
                <a href="/" className="text-sm hover:underline">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground">
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto flex items-center justify-center py-12">
        <Card className="w-full max-w-md p-8 shadow-md">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Welcome to your new app</h2>
            <p className="text-muted-foreground mb-6">
              This is a clean starting point for your React project.
              Start building something amazing!
            </p>
            <Button>Get Started</Button>
          </div>
        </Card>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MyApp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
