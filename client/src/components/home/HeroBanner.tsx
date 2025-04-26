import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function HeroBanner() {
  const [, navigate] = useLocation();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query parameters
    const params = new URLSearchParams();
    if (keyword) params.append("query", keyword);
    if (location) params.append("location", location);
    
    // Navigate to search page with filters
    navigate(`/jobs?${params.toString()}`);
  };
  
  return (
    <section className="bg-secondary text-white py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl font-bold mb-4">Find Your Dream Job Today</h1>
            <p className="text-lg text-slate-300 mb-8">
              Connect with thousands of employers looking for talented professionals like you.
            </p>
            
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
                <div className="flex-1">
                  <label htmlFor="keyword" className="block text-sm font-medium text-slate-700 mb-1">
                    What
                  </label>
                  <Input
                    id="keyword"
                    placeholder="Job title, keywords, or company"
                    className="w-full px-4 py-2 border border-slate-300 rounded-md text-slate-800"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
                    Where
                  </label>
                  <Input
                    id="location"
                    placeholder="City, state, or remote"
                    className="w-full px-4 py-2 border border-slate-300 rounded-md text-slate-800"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="self-end mt-4 md:mt-0">
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </form>
            </div>
          </div>
          <div className="md:w-1/2 md:pl-12">
            <img 
              src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Professional in an office environment" 
              className="rounded-lg shadow-xl" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
