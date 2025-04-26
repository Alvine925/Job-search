import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import JobCard from "@/components/jobs/JobCard";
import { Skeleton } from "@/components/ui/skeleton";

interface FeaturedJobsProps {
  jobs: any[];
  isLoading: boolean;
}

export default function FeaturedJobs({ jobs, isLoading }: FeaturedJobsProps) {
  // Create skeleton cards for loading state
  const skeletonCards = Array(3).fill(0).map((_, i) => (
    <div key={i} className="bg-white rounded-lg shadow p-6 border border-slate-200">
      <div className="flex justify-between items-start mb-4">
        <Skeleton className="h-12 w-12 rounded" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-1" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex flex-wrap gap-2 mb-4">
        <Skeleton className="h-5 w-12 rounded" />
        <Skeleton className="h-5 w-16 rounded" />
        <Skeleton className="h-5 w-14 rounded" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  ));
  
  // Get the first 3 jobs for featured display
  const featuredJobs = jobs.slice(0, 3);
  
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-secondary">Featured Jobs</h2>
          <Link href="/jobs" className="text-primary hover:text-blue-700 font-medium flex items-center">
            View all jobs
            <ChevronRight className="h-5 w-5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            skeletonCards
          ) : featuredJobs.length > 0 ? (
            featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} variant="compact" />
            ))
          ) : (
            <div className="col-span-3 text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-slate-500 mb-4">No jobs available at the moment.</p>
              <Button asChild>
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
