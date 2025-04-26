import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle } from "lucide-react";

export default function UserTypeSwitcher() {
  const [activeTab, setActiveTab] = useState("jobSeeker");
  const { user } = useAuth();
  
  return (
    <section className="py-12 bg-slate-100">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-secondary mb-12">JobMatch for Everyone</h2>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex flex-wrap">
            {/* Tab Buttons */}
            <div className="w-full flex border-b border-slate-200">
              <button 
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium ${
                  activeTab === "jobSeeker" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setActiveTab("jobSeeker")}
              >
                Job Seekers
              </button>
              <button 
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium ${
                  activeTab === "employer" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setActiveTab("employer")}
              >
                Employers
              </button>
            </div>
            
            {/* Tab Content - Job Seekers */}
            {activeTab === "jobSeeker" && (
              <div className="w-full p-6">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                    <h3 className="text-xl font-semibold text-secondary mb-4">Find Your Next Career Move</h3>
                    <p className="mb-6 text-slate-600">
                      JobMatch helps job seekers like you discover opportunities that match your skills, experience, and career goals.
                    </p>
                    
                    <ul className="space-y-4 mb-8">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 mr-2" />
                        <div>
                          <h4 className="font-medium text-secondary">Create a Professional Profile</h4>
                          <p className="text-sm text-slate-600">Showcase your skills and experience to stand out to recruiters.</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 mr-2" />
                        <div>
                          <h4 className="font-medium text-secondary">Apply with Ease</h4>
                          <p className="text-sm text-slate-600">One-click applications make job hunting efficient.</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 mr-2" />
                        <div>
                          <h4 className="font-medium text-secondary">Track Your Applications</h4>
                          <p className="text-sm text-slate-600">Always know where you stand in the hiring process.</p>
                        </div>
                      </li>
                    </ul>
                    
                    <Button asChild>
                      <Link href={user ? "/profile" : "/auth?tab=register&type=jobSeeker"}>
                        {user ? "Update Your Profile" : "Create Your Profile"}
                      </Link>
                    </Button>
                  </div>
                  <div className="md:w-1/2">
                    <img 
                      src="https://images.unsplash.com/photo-1573497019707-1c04codd76c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                      alt="Professional job seeker using laptop" 
                      className="rounded-lg shadow-md" 
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Tab Content - Employers */}
            {activeTab === "employer" && (
              <div className="w-full p-6">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                    <h3 className="text-xl font-semibold text-secondary mb-4">Find the Perfect Talent for Your Team</h3>
                    <p className="mb-6 text-slate-600">
                      JobMatch helps employers connect with qualified professionals who match your hiring needs.
                    </p>
                    
                    <ul className="space-y-4 mb-8">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 mr-2" />
                        <div>
                          <h4 className="font-medium text-secondary">Create a Company Profile</h4>
                          <p className="text-sm text-slate-600">Showcase your company culture to attract the best talent.</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 mr-2" />
                        <div>
                          <h4 className="font-medium text-secondary">Post Jobs Easily</h4>
                          <p className="text-sm text-slate-600">Create detailed job listings in minutes.</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 mr-2" />
                        <div>
                          <h4 className="font-medium text-secondary">Manage Applications</h4>
                          <p className="text-sm text-slate-600">Review and respond to candidates all in one place.</p>
                        </div>
                      </li>
                    </ul>
                    
                    <Button asChild>
                      <Link href={user ? (user.userType === "employer" ? "/post-job" : "/auth?tab=register&type=employer") : "/auth?tab=register&type=employer"}>
                        {user && user.userType === "employer" ? "Post a Job" : "Get Started as an Employer"}
                      </Link>
                    </Button>
                  </div>
                  <div className="md:w-1/2">
                    <img 
                      src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                      alt="HR team reviewing applications" 
                      className="rounded-lg shadow-md" 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
