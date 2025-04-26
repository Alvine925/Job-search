import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  User, 
  Briefcase, 
  MessageSquare, 
  FileText, 
  Settings, 
  LogOut, 
  ChevronRight,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  if (!user) return null;
  
  const isJobSeeker = user.userType === "jobSeeker";
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const navItems = [
    {
      label: "Profile",
      icon: <User className="h-5 w-5" />,
      href: "/profile",
      active: location === "/profile",
    },
    {
      label: isJobSeeker ? "My Applications" : "Manage Jobs",
      icon: <FileText className="h-5 w-5" />,
      href: "/applications",
      active: location === "/applications",
    },
    {
      label: "Messages",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/messages",
      active: location.startsWith("/messages"),
    }
  ];
  
  // Add employer specific links
  if (!isJobSeeker) {
    navItems.splice(1, 0, {
      label: "Post a Job",
      icon: <Briefcase className="h-5 w-5" />,
      href: "/post-job",
      active: location === "/post-job",
    });
  }
  
  return (
    <div className={cn("w-full md:w-64 bg-white border-r border-slate-200", className)}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-secondary">Dashboard</h2>
          <p className="text-sm text-slate-500">
            {isJobSeeker ? "Manage your job search" : "Manage your hiring"}
          </p>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={item.active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  item.active ? "bg-slate-100 text-secondary" : "text-slate-600"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    {item.icon}
                    <span className="ml-3 font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-transform",
                    item.active ? "rotate-90" : ""
                  )} />
                </div>
              </Button>
            </Link>
          ))}
        </nav>
        
        <div className="mt-6 pt-6 border-t border-slate-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
