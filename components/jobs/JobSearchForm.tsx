import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";

interface JobSearchFormProps {
  onSearch: (filters: { query: string; location: string }) => void;
  initialValues?: { query: string; location: string };
  className?: string;
}

export default function JobSearchForm({ 
  onSearch, 
  initialValues = { query: "", location: "" },
  className
}: JobSearchFormProps) {
  const [keyword, setKeyword] = useState(initialValues.query || "");
  const [location, setLocation] = useState(initialValues.location || "");
  
  // Update local state when props change
  useEffect(() => {
    setKeyword(initialValues.query || "");
    setLocation(initialValues.location || "");
  }, [initialValues]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ query: keyword, location });
  };
  
  return (
    <form onSubmit={handleSubmit} className={`flex flex-col md:flex-row gap-4 ${className}`}>
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder="Job title, keywords, or company"
          className="pl-10"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>
      
      <div className="flex-1 relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder="City, state, or remote"
          className="pl-10"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      
      <Button type="submit" className="md:w-auto">
        <Search className="h-4 w-4 mr-2" />
        Search Jobs
      </Button>
    </form>
  );
}
