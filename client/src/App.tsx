import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import JobSearchPage from "@/pages/job-search-page";
import JobDetailsPage from "@/pages/job-details-page";
import ProfilePage from "@/pages/profile-page";
import CompanyPage from "@/pages/company-page";
import PostJobPage from "@/pages/post-job-page";
import ApplicationsPage from "@/pages/applications-page";
import MessagesPage from "@/pages/messages-page";
import { ProtectedRoute, EmployerRoute, JobSeekerRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from 'next-themes';

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/jobs" component={JobSearchPage} />
      <Route path="/jobs/:id" component={JobDetailsPage} />
      <Route path="/companies/:id" component={CompanyPage} />
      
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/messages" component={MessagesPage} />
      <ProtectedRoute path="/messages/:partnerId" component={MessagesPage} />
      
      <JobSeekerRoute path="/applications" component={ApplicationsPage} />
      
      <EmployerRoute path="/post-job" component={PostJobPage} />
      <EmployerRoute path="/manage-jobs" component={ApplicationsPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
