import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Briefcase, 
  Menu, 
  User, 
  LogOut, 
  MessageSquare, 
  FileText, 
  ChevronDown,
  Building,
  Bell 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-semibold text-secondary">JobMatch</span>
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              <Link 
                href="/jobs" 
                className={`${isActive("/jobs") ? "text-primary" : "text-slate-600"} hover:text-primary font-medium`}
              >
                Find Jobs
              </Link>
              <Link 
                href="/companies" 
                className={`${isActive("/companies") ? "text-primary" : "text-slate-600"} hover:text-primary font-medium`}
              >
                Companies
              </Link>
              {user?.userType === "employer" && (
                <Link 
                  href="/post-job" 
                  className={`${isActive("/post-job") ? "text-primary" : "text-slate-600"} hover:text-primary font-medium`}
                >
                  Post a Job
                </Link>
              )}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex space-x-3 items-center">
                  <Link href="/messages">
                    <Button variant="ghost" size="icon" className="relative">
                      <MessageSquare className="h-5 w-5" />
                      {/* Notification dot if there are unread messages */}
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full"></span>
                    </Button>
                  </Link>
                  
                  <Link href="/applications">
                    <Button variant="ghost" size="icon">
                      <FileText className="h-5 w-5" />
                    </Button>
                  </Link>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-white">
                            {user.username ? user.username.slice(0, 2).toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden lg:block font-medium text-sm">{user.username}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer w-full">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/applications" className="cursor-pointer w-full">
                          <FileText className="mr-2 h-4 w-4" />
                          <span>
                            {user.userType === "jobSeeker" ? "My Applications" : "Manage Jobs"}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/messages" className="cursor-pointer w-full">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          <span>Messages</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-6 w-6 text-slate-700" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[80%]">
                    <div className="flex flex-col space-y-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-white">
                            {user.username ? user.username.slice(0, 2).toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.userType === "jobSeeker" ? "Job Seeker" : "Employer"}
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-slate-200 pt-4">
                        <Link href="/profile" className="flex items-center py-2" onClick={() => setMobileMenuOpen(false)}>
                          <User className="h-5 w-5 mr-3 text-slate-500" />
                          <span>Profile</span>
                        </Link>
                        <Link href="/applications" className="flex items-center py-2" onClick={() => setMobileMenuOpen(false)}>
                          <FileText className="h-5 w-5 mr-3 text-slate-500" />
                          <span>
                            {user.userType === "jobSeeker" ? "My Applications" : "Manage Jobs"}
                          </span>
                        </Link>
                        <Link href="/messages" className="flex items-center py-2" onClick={() => setMobileMenuOpen(false)}>
                          <MessageSquare className="h-5 w-5 mr-3 text-slate-500" />
                          <span>Messages</span>
                        </Link>
                      </div>
                      
                      <div className="border-t border-slate-200 pt-4">
                        <Link href="/jobs" className="flex items-center py-2" onClick={() => setMobileMenuOpen(false)}>
                          <Briefcase className="h-5 w-5 mr-3 text-slate-500" />
                          <span>Find Jobs</span>
                        </Link>
                        <Link href="/companies" className="flex items-center py-2" onClick={() => setMobileMenuOpen(false)}>
                          <Building className="h-5 w-5 mr-3 text-slate-500" />
                          <span>Companies</span>
                        </Link>
                        {user?.userType === "employer" && (
                          <Link href="/post-job" className="flex items-center py-2" onClick={() => setMobileMenuOpen(false)}>
                            <Briefcase className="h-5 w-5 mr-3 text-slate-500" />
                            <span>Post a Job</span>
                          </Link>
                        )}
                      </div>
                      
                      <div className="border-t border-slate-200 pt-4">
                        <button 
                          className="flex items-center py-2 text-red-500 w-full" 
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="h-5 w-5 mr-3" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <>
                <Link href="/auth" className="hidden md:block text-slate-600 hover:text-primary font-medium">
                  Sign In
                </Link>
                <Link href="/auth?tab=register" className="hidden md:block">
                  <Button>Create Account</Button>
                </Link>
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-6 w-6 text-slate-700" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[80%]">
                    <div className="flex flex-col space-y-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Briefcase className="h-8 w-8 text-primary" />
                        <div className="font-medium text-xl">JobMatch</div>
                      </div>
                      
                      <div className="border-t border-slate-200 pt-4">
                        <Link href="/jobs" className="flex items-center py-2" onClick={() => setMobileMenuOpen(false)}>
                          <Briefcase className="h-5 w-5 mr-3 text-slate-500" />
                          <span>Find Jobs</span>
                        </Link>
                        <Link href="/companies" className="flex items-center py-2" onClick={() => setMobileMenuOpen(false)}>
                          <Building className="h-5 w-5 mr-3 text-slate-500" />
                          <span>Companies</span>
                        </Link>
                      </div>
                      
                      <div className="border-t border-slate-200 pt-4">
                        <Link 
                          href="/auth" 
                          className="flex items-center py-2" 
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <User className="h-5 w-5 mr-3 text-slate-500" />
                          <span>Sign In</span>
                        </Link>
                        <Link 
                          href="/auth?tab=register" 
                          className="flex items-center py-2" 
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Briefcase className="h-5 w-5 mr-3 text-slate-500" />
                          <span>Create Account</span>
                        </Link>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
