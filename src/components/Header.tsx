import { useEffect, useState } from "react";
import { Moon, Sun, User } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export const Header = () => {
  const [greeting, setGreeting] = useState("Welcome to AIRIS");
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning, welcome to AIRIS");
    } else if (hour < 18) {
      setGreeting("Good afternoon, welcome to AIRIS");
    } else {
      setGreeting("Good evening, welcome to AIRIS");
    }
  }, []);

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Analytics", path: "/analytics" },
    { name: "Energy", path: "/energy" }
  ];

  return (
    <header className="bg-gray-900 dark:bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:py-6">
          {/* Logo and Greeting */}
          <div className="flex items-center space-x-4">
            <img 
              src="/airis-logo.svg" 
              alt="AIRIS Logo" 
              className="h-10 w-10"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
                console.log("Logo failed to load, using placeholder");
              }}
            />
            <div>
              <h1 className="text-xl font-bold text-white dark:text-gray-900">
                AIRIS
              </h1>
              <p className="text-sm text-gray-300 dark:text-gray-600">
                {greeting}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-2 bg-gray-800 dark:bg-gray-200 rounded-full p-1">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  location.pathname === item.path
                    ? "bg-blue-500 text-white dark:bg-blue-600"
                    : "text-gray-300 dark:text-gray-600 hover:bg-gray-700 dark:hover:bg-gray-300"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-gray-700 dark:hover:bg-gray-200"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-500 transition-all" />
              ) : (
                <Moon className="h-5 w-5 text-slate-900 transition-all" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Profile Icon */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-gray-700 dark:hover:bg-gray-200"
              onClick={() => navigate('/profile')}
            >
              <User className="h-5 w-5" />
              <span className="sr-only">My Profile</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};