
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronRight, CheckCircle, Grid3X3, Users, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="py-4 border-b border-border/50 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Grid3X3 className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-display font-bold text-foreground">TaskForge</h1>
          </div>
          <nav>
            <ul className="hidden md:flex gap-8 items-center">
              <li>
                <a href="#features" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#why" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Why TaskForge
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Testimonials
                </a>
              </li>
            </ul>
          </nav>
          <div>
            {user ? (
              <Button asChild>
                <Link to="/dashboard" className="flex items-center gap-2">
                  Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      
      {/* Hero section */}
      <section className="py-16 md:py-24 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight gradient-heading mb-6">
            Organize Work & Manage Projects with TaskForge
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            The collaborative Kanban board application with powerful dependency tracking. 
            Perfect for teams who need to visualize their workflow and manage complex projects.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="rounded-full px-8 py-6 text-base font-medium">
              <Link to="/auth">
                Get Started Free <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-full px-8 py-6 text-base font-medium">
              <a href="#features">
                Learn More
              </a>
            </Button>
          </div>
        </div>
        
        {/* Hero image */}
        <div className="mt-16 max-w-5xl mx-auto rounded-xl overflow-hidden shadow-xl border border-border/50">
          <img 
            src="https://images.unsplash.com/photo-1611224885990-ab7363d1f2a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1469&q=80" 
            alt="TaskForge Dashboard" 
            className="w-full h-auto"
          />
        </div>
      </section>
      
      {/* Features section */}
      <section id="features" className="py-16 md:py-24 bg-accent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage projects and track progress efficiently.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-border/40">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Grid3X3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Kanban Board</h3>
              <p className="text-muted-foreground">
                Visualize your workflow with customizable columns and drag-and-drop cards.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-border/40">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Team Collaboration</h3>
              <p className="text-muted-foreground">
                Invite team members, assign tasks, and work together seamlessly.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-border/40">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Dependency Tracking</h3>
              <p className="text-muted-foreground">
                Define dependencies between tasks and track progress with clarity.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why TaskForge Section */}
      <section id="why" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Why TaskForge?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We built TaskForge to solve real project management challenges.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-lg">Intuitive Design</h3>
                    <p className="text-muted-foreground">Simple and easy to use interface that anyone can understand.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-lg">Real-time Updates</h3>
                    <p className="text-muted-foreground">All changes are synchronized instantly across all team members.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-lg">Dependency Visualization</h3>
                    <p className="text-muted-foreground">Clearly see how tasks are related and identify bottlenecks.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-lg">Customizable Workflow</h3>
                    <p className="text-muted-foreground">Adapt TaskForge to fit your team's unique processes.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <div className="rounded-xl overflow-hidden shadow-lg border border-border/50">
                <img 
                  src="https://images.unsplash.com/photo-1559028012-481c04fa702d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1336&q=80" 
                  alt="TaskForge in action" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to boost your team's productivity?</h2>
          <p className="mb-8 max-w-2xl mx-auto text-primary-foreground/80">
            Join thousands of teams who use TaskForge to collaborate efficiently and deliver projects on time.
          </p>
          <Button size="lg" variant="secondary" asChild className="rounded-full px-8 py-6 text-base font-medium">
            <Link to="/auth">
              Get Started Now <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <Grid3X3 className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-bold">TaskForge</h2>
            </div>
            <nav>
              <ul className="flex gap-8">
                <li>
                  <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#why" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Why TaskForge
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} TaskForge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
