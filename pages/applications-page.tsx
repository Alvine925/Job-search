import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ApplicationsList from "@/components/applications/ApplicationsList";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Users, Filter, Briefcase } from "lucide-react";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("all");

  // Determine if user is employer or job seeker
  const isEmployer = user?.userType === "employer";

  // For job seekers: Get their applications
  const { 
    data: jobSeekerApplications, 
    isLoading: isLoadingJobSeekerApplications 
  } = useQuery({
    queryKey: ['/api/applications/jobseeker'],
    queryFn: async () => {
      if (!user || user.userType !== 'jobSeeker') return [];
      const res = await apiRequest('GET', '/api/applications/jobseeker');
      return await res.json();
    },
    enabled: !!user && user.userType === 'jobSeeker',
  });

  // For employers: Get applications for their jobs
  const { 
    data: employerApplications, 
    isLoading: isLoadingEmployerApplications 
  } = useQuery({
    queryKey: ['/api/applications/employer'],
    queryFn: async () => {
      if (!user || user.userType !== 'employer') return [];
      const res = await apiRequest('GET', '/api/applications/employer');
      return await res.json();
    },
    enabled: !!user && user.userType === 'employer',
  });

  // For employers: Get their posted jobs
  const { 
    data: employerJobs, 
    isLoading: isLoadingEmployerJobs 
  } = useQuery({
    queryKey: ['/api/jobs/company', user?.id],
    queryFn: async () => {
      if (!user || user.userType !== 'employer') return [];
      // Get employer's company profile first
      const profileRes = await apiRequest('GET', `/api/profiles/company/${user.id}`);
      const companyProfile = await profileRes.json();
      // Then get jobs for this company
      const jobsRes = await apiRequest('GET', `/api/jobs/company/${companyProfile.id}`);
      return await jobsRes.json();
    },
    enabled: !!user && user.userType === 'employer',
  });

  // Mutation for updating application status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: number; status: string }) => {
      return apiRequest('PUT', `/api/applications/${applicationId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications/employer'] });
      toast({
        title: "Status updated",
        description: "Application status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handler for status updates
  const handleStatusChange = (applicationId: number, status: string) => {
    updateStatusMutation.mutate({ applicationId, status });
  };

  // Filter applications by status for employers
  const getFilteredApplications = () => {
    if (!employerApplications) return [];
    
    if (activeTab === "all") {
      return employerApplications;
    }
    
    return employerApplications.filter((app: any) => app.status === activeTab);
  };

  // Count applications by status
  const getStatusCounts = () => {
    if (!employerApplications) return { all: 0 };
    
    const counts: Record<string, number> = { all: employerApplications.length };
    
    employerApplications.forEach((app: any) => {
      if (!counts[app.status]) {
        counts[app.status] = 0;
      }
      counts[app.status]++;
    });
    
    return counts;
  };

  // Get application status counts
  const statusCounts = getStatusCounts();

  // Check if there's any loading state
  const isLoading = isLoadingJobSeekerApplications || isLoadingEmployerApplications || isLoadingEmployerJobs;

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !isLoading) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <>
        <Header />
        <DashboardLayout>
          <div className="flex justify-center items-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <DashboardLayout>
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-secondary">
                {isEmployer ? "Manage Applications" : "My Applications"}
              </h1>
              <p className="text-slate-500">
                {isEmployer 
                  ? "Review and manage job applications from candidates" 
                  : "Track your job applications and their status"}
              </p>
            </div>
            
            {isEmployer && (
              <Button asChild>
                <a href="/post-job">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Post a New Job
                </a>
              </Button>
            )}
          </div>

          {isEmployer ? (
            <>
              {/* Employer View */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Application Statistics</CardTitle>
                  <CardDescription>Overview of applications for your job postings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <div className="text-sm text-slate-500 mb-1">Total Applications</div>
                      <div className="text-2xl font-semibold">{statusCounts.all || 0}</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-slate-500 mb-1">New/Pending</div>
                      <div className="text-2xl font-semibold">{statusCounts.pending || 0}</div>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <div className="text-sm text-slate-500 mb-1">Reviewing</div>
                      <div className="text-2xl font-semibold">{statusCounts.reviewing || 0}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-slate-500 mb-1">Interviewed</div>
                      <div className="text-2xl font-semibold">{statusCounts.interviewed || 0}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Applications</h2>
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-slate-400" />
                  <span className="text-sm text-slate-500">Filter by status:</span>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid grid-cols-4 md:grid-cols-7 mb-6">
                  <TabsTrigger value="all">
                    All ({statusCounts.all || 0})
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending ({statusCounts.pending || 0})
                  </TabsTrigger>
                  <TabsTrigger value="reviewing">
                    Reviewing ({statusCounts.reviewing || 0})
                  </TabsTrigger>
                  <TabsTrigger value="interviewed">
                    Interviewed ({statusCounts.interviewed || 0})
                  </TabsTrigger>
                  <TabsTrigger value="offered">
                    Offered ({statusCounts.offered || 0})
                  </TabsTrigger>
                  <TabsTrigger value="accepted">
                    Accepted ({statusCounts.accepted || 0})
                  </TabsTrigger>
                  <TabsTrigger value="rejected">
                    Rejected ({statusCounts.rejected || 0})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab} className="mt-0">
                  <ApplicationsList 
                    applications={getFilteredApplications()} 
                    type="employer"
                    onStatusChange={handleStatusChange}
                  />
                </TabsContent>
              </Tabs>

              {/* Posted Jobs Section */}
              <div className="mt-10">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-primary" />
                  Your Posted Jobs ({employerJobs?.length || 0})
                </h2>
                
                {employerJobs && employerJobs.length > 0 ? (
                  <div className="space-y-4">
                    {employerJobs.map((job: any) => (
                      <Card key={job.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold">{job.title}</h3>
                              <div className="flex items-center text-sm text-slate-500 mt-1">
                                <Users className="h-4 w-4 mr-1" />
                                <span>
                                  {employerApplications?.filter((app: any) => app.jobId === job.id).length || 0} applications
                                </span>
                              </div>
                            </div>
                            <Button variant="outline" asChild>
                              <a href={`/jobs/${job.id}`}>View Job</a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-6 pb-6 text-center">
                      <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <Briefcase className="h-6 w-6 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No jobs posted yet</h3>
                      <p className="text-slate-500 mb-4">
                        Start attracting qualified candidates by posting your first job.
                      </p>
                      <Button asChild>
                        <a href="/post-job">Post a Job</a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Job Seeker View */}
              <div className="flex items-center mb-4">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                <h2 className="text-xl font-semibold">Your Applications</h2>
              </div>
              
              <ApplicationsList 
                applications={jobSeekerApplications || []} 
                type="jobSeeker" 
              />
            </>
          )}
        </div>
      </DashboardLayout>
      <Footer />
    </>
  );
}
