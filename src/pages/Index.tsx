
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-medium">TaskForge</h1>
          <nav>
            <ul className="flex gap-6">
              <li>
                <a href="/" className="text-sm hover:underline">
                  Home
                </a>
              </li>
              <li>
                <a href="#features" className="text-sm text-muted-foreground">
                  Features
                </a>
              </li>
              <li>
                <a href="#about" className="text-sm text-muted-foreground">
                  About
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto flex items-center justify-center py-12">
        <Card className="w-full max-w-md p-8 shadow-md">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Welcome to TaskForge</h2>
            <p className="text-muted-foreground mb-6">
              Organize your work, manage projects, and reach new productivity peaks.
            </p>
            {user ? (
              <Button as={Link} to="/dashboard">Go to Dashboard</Button>
            ) : (
              <Button as={Link} to="/auth">Get Started</Button>
            )}
          </div>
        </Card>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} TaskForge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
