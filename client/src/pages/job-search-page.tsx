import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JobSearchForm from "@/components/jobs/JobSearchForm";
import JobFilters from "@/components/jobs/JobFilters";
import JobCard from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";

export default function JobSearchPage() {
  const [filters, setFilters] = useState({
    query: "",
    location: "",
    type: "",
  });

  // Load jobs with current filters
  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['/api/jobs', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters.query) queryParams.append('query', filters.query);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.type) queryParams.append('type', filters.type);
      
      const res = await apiRequest('GET', `/api/jobs?${queryParams.toString()}`);
      return await res.json();
    },
  });

  const handleSearch = (searchFilters: any) => {
    setFilters(prev => ({ ...prev, ...searchFilters }));
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      location: "",
      type: "",
    });
  };

  return (
    <>
      <Header />
      <main className="bg-slate-50 min-h-screen">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-secondary mb-6">Find Your Dream Job</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <JobSearchForm onSearch={handleSearch} initialValues={filters} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-sm text-primary hover:text-primary"
                  >
                    Clear all
                  </Button>
                </div>
                <JobFilters filters={filters} onChange={handleFilterChange} />
              </div>
            </div>
            
            {/* Job Results */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : jobs && jobs.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-slate-600">{jobs.length} jobs found</p>
                    <div className="flex items-center text-sm text-slate-500">
                      <span>Sort by: </span>
                      <select className="ml-2 p-1 border rounded bg-white">
                        <option>Most relevant</option>
                        <option>Newest</option>
                        <option>Salary (high to low)</option>
                      </select>
                    </div>
                  </div>
                  
                  {jobs.map((job: any) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-secondary mb-2">No jobs found</h3>
                  <p className="text-slate-500 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                  <Button onClick={clearFilters}>Clear all filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
