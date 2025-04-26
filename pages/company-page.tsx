import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useParams, Link } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import JobCard from "@/components/jobs/JobCard";
import { Building, MapPin, Link as LinkIcon, Users, Briefcase, Loader2 } from "lucide-react";

export default function CompanyPage() {
  const params = useParams<{ id: string }>();
  
  // Load company profile
  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['/api/companies', params.id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/companies/${params.id}`);
      return await res.json();
    },
  });
  
  // Load jobs for this company
  const { data: jobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['/api/jobs/company', params.id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/jobs/company/${params.id}`);
      return await res.json();
    },
    enabled: !!company,
  });
  
  if (isLoadingCompany) {
    return (
      <>
        <Header />
        <main className="bg-slate-50 min-h-screen py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary my-12" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  if (!company) {
    return (
      <>
        <Header />
        <main className="bg-slate-50 min-h-screen py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-secondary mb-4">Company Not Found</h2>
              <p className="text-muted-foreground mb-8">The company you're looking for doesn't exist or has been removed.</p>
              <Button asChild>
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Header />
      <main className="bg-slate-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Company Header */}
          <div className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
            <div className="bg-secondary/5 p-6 pb-8">
              <div className="flex flex-col md:flex-row items-center md:items-start">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4 md:mb-0 md:mr-6">
                  <img 
                    src={company.logoUrl || "https://via.placeholder.com/120"}
                    alt={company.name}
                    className="w-24 h-24 object-contain"
                  />
                </div>
                <div className="text-center md:text-left">
                  <h1 className="text-2xl md:text-3xl font-bold text-secondary mb-2">{company.name}</h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 items-center text-slate-600 mb-3">
                    {company.industry && (
                      <Badge variant="outline" className="flex items-center">
                        <Building className="h-3.5 w-3.5 mr-1" />
                        {company.industry}
                      </Badge>
                    )}
                    {company.location && (
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {company.location}
                      </span>
                    )}
                    {company.size && (
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {company.size} employees
                      </span>
                    )}
                  </div>
                  {company.website && (
                    <a 
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center justify-center md:justify-start"
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Company Description */}
          {company.description && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold text-secondary mb-4">About {company.name}</h2>
              <div className="prose max-w-none">
                <p className="text-slate-600">{company.description}</p>
              </div>
            </div>
          )}
          
          {/* Company Jobs */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-secondary">Open Positions</h2>
              <div className="flex items-center text-slate-600">
                <Briefcase className="h-5 w-5 mr-2" />
                {isLoadingJobs ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>{jobs?.length || 0} open positions</span>
                )}
              </div>
            </div>
            
            {isLoadingJobs ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : jobs && jobs.length > 0 ? (
              <div className="space-y-6">
                {jobs.map((job: any) => (
                  <JobCard 
                    key={job.id} 
                    job={{
                      ...job,
                      company: {
                        id: company.id,
                        name: company.name,
                        logoUrl: company.logoUrl
                      }
                    }} 
                    hideCompanyInfo
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-secondary mb-2">No open positions</h3>
                <p className="text-slate-500 mb-6">This company doesn't have any open positions at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
