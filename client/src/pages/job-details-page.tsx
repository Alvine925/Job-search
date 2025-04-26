import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useParams, Link } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Building,
  Users,
  Link as LinkIcon,
  CheckCircle,
  Loader2,
  Share2,
  Bookmark
} from "lucide-react";

const applicationSchema = z.object({
  coverLetter: z.string().min(20, {
    message: "Cover letter should be at least 20 characters",
  }),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export default function JobDetailsPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isApplying, setIsApplying] = useState(false);
  
  // Load job details
  const { data: job, isLoading } = useQuery({
    queryKey: ['/api/jobs', params.id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/jobs/${params.id}`);
      return await res.json();
    },
  });
  
  // Check if user has already applied for this job
  const { data: applications } = useQuery({
    queryKey: ['/api/applications/jobseeker'],
    queryFn: async () => {
      if (user?.userType !== 'jobSeeker') return [];
      const res = await apiRequest('GET', '/api/applications/jobseeker');
      return await res.json();
    },
    enabled: !!user && user.userType === 'jobSeeker',
  });
  
  const hasApplied = applications?.some((app: any) => app.jobId === parseInt(params.id));
  
  // Application form
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      coverLetter: "",
    },
  });
  
  const applyMutation = useMutation({
    mutationFn: async (data: ApplicationFormValues) => {
      return apiRequest('POST', '/api/applications', {
        jobId: parseInt(params.id),
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications/jobseeker'] });
      toast({
        title: "Application submitted",
        description: "Your application has been successfully submitted.",
      });
      setIsApplying(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to submit application",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(values: ApplicationFormValues) {
    applyMutation.mutate(values);
  }
  
  // Handle apply button click
  const handleApply = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (user.userType !== 'jobSeeker') {
      toast({
        title: "Employer account",
        description: "You're logged in as an employer. Only job seekers can apply for jobs.",
        variant: "destructive",
      });
      return;
    }
    
    setIsApplying(true);
  };
  
  if (isLoading) {
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
  
  if (!job) {
    return (
      <>
        <Header />
        <main className="bg-slate-50 min-h-screen py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-secondary mb-4">Job Not Found</h2>
              <p className="text-muted-foreground mb-8">The job you're looking for doesn't exist or has been removed.</p>
              <Button asChild>
                <Link href="/jobs">Browse All Jobs</Link>
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
          {/* Job Header */}
          <div className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
            <div className="bg-secondary/5 p-6 pb-8">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="flex flex-col md:flex-row items-start md:items-center">
                  <div className="bg-white p-4 rounded-lg shadow-sm mb-4 md:mb-0 md:mr-6">
                    <img 
                      src={job.company?.logoUrl || "https://via.placeholder.com/80"}
                      alt={job.company?.name || "Company logo"}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-secondary mb-2">{job.title}</h1>
                    <div className="flex flex-wrap gap-2 items-center text-slate-600 mb-3">
                      <span className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {job.company?.name || "Company"}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </span>
                      <Badge variant="outline" className="flex items-center">
                        <Briefcase className="h-3.5 w-3.5 mr-1" />
                        {job.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col mt-4 md:mt-0">
                  {job.salary && (
                    <div className="text-lg font-semibold text-primary mb-2 flex items-center">
                      <DollarSign className="h-5 w-5 mr-1" />
                      {job.salary}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Bookmark className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Banner */}
            <div className="border-t border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-center">
              <div className="mb-4 sm:mb-0">
                <div className="text-sm text-slate-500 mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" /> 
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-slate-500">
                  <Users className="h-4 w-4 inline mr-1" />
                  {job.applicationCount || 0} applicants
                </div>
              </div>
              {hasApplied ? (
                <div className="flex items-center text-success font-medium">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  You have applied to this job
                </div>
              ) : (
                <Button 
                  size="lg"
                  onClick={handleApply}
                  disabled={!user || applyMutation.isPending}
                >
                  {applyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Apply Now
                </Button>
              )}
            </div>
          </div>

          {/* Apply Form Dialog */}
          {isApplying && !hasApplied && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-secondary mb-4">Apply to {job.title}</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="coverLetter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cover Letter</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell the employer why you're a good fit for this role..."
                              className="min-h-[200px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-3">
                      <Button type="submit" disabled={applyMutation.isPending}>
                        {applyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Application
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsApplying(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Job Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-xl font-bold text-secondary mb-4">Job Description</h2>
                <div className="prose max-w-none">
                  <p className="mb-4 text-slate-600">{job.description}</p>
                </div>

                {job.requirements && (
                  <>
                    <h3 className="text-lg font-semibold text-secondary mt-6 mb-3">Requirements</h3>
                    <div className="prose max-w-none">
                      <p className="text-slate-600">{job.requirements}</p>
                    </div>
                  </>
                )}

                {job.benefits && (
                  <>
                    <h3 className="text-lg font-semibold text-secondary mt-6 mb-3">Benefits</h3>
                    <div className="prose max-w-none">
                      <p className="text-slate-600">{job.benefits}</p>
                    </div>
                  </>
                )}

                {job.skills && job.skills.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold text-secondary mt-6 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {job.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Company Details */}
              {job.company && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-secondary mb-4">About the Company</h2>
                  <div className="flex items-center mb-4">
                    <img 
                      src={job.company.logoUrl || "https://via.placeholder.com/80"}
                      alt={job.company.name}
                      className="w-16 h-16 object-contain mr-4 bg-slate-100 p-2 rounded"
                    />
                    <div>
                      <h3 className="text-lg font-semibold">{job.company.name}</h3>
                      {job.company.industry && (
                        <p className="text-slate-600 text-sm">{job.company.industry}</p>
                      )}
                    </div>
                  </div>
                  
                  {job.company.description && (
                    <div className="prose max-w-none mb-6">
                      <p className="text-slate-600">{job.company.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {job.company.location && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-slate-400 mt-0.5 mr-2" />
                        <div>
                          <div className="text-sm font-medium">Location</div>
                          <div className="text-slate-600">{job.company.location}</div>
                        </div>
                      </div>
                    )}
                    
                    {job.company.size && (
                      <div className="flex items-start">
                        <Users className="h-5 w-5 text-slate-400 mt-0.5 mr-2" />
                        <div>
                          <div className="text-sm font-medium">Company size</div>
                          <div className="text-slate-600">{job.company.size} employees</div>
                        </div>
                      </div>
                    )}
                    
                    {job.company.website && (
                      <div className="flex items-start">
                        <LinkIcon className="h-5 w-5 text-slate-400 mt-0.5 mr-2" />
                        <div>
                          <div className="text-sm font-medium">Website</div>
                          <a 
                            href={job.company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {job.company.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      variant="outline" 
                      asChild
                    >
                      <Link href={`/companies/${job.company.id}`}>
                        View Company Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6 sticky top-6">
                <h2 className="text-lg font-semibold text-secondary mb-4">Job Overview</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Briefcase className="h-5 w-5 text-slate-400 mt-0.5 mr-3" />
                    <div>
                      <div className="text-sm font-medium">Job Type</div>
                      <div className="text-slate-600">{job.type}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-slate-400 mt-0.5 mr-3" />
                    <div>
                      <div className="text-sm font-medium">Location</div>
                      <div className="text-slate-600">{job.location}</div>
                    </div>
                  </div>
                  
                  {job.salary && (
                    <div className="flex items-start">
                      <DollarSign className="h-5 w-5 text-slate-400 mt-0.5 mr-3" />
                      <div>
                        <div className="text-sm font-medium">Salary</div>
                        <div className="text-slate-600">{job.salary}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-slate-400 mt-0.5 mr-3" />
                    <div>
                      <div className="text-sm font-medium">Posted Date</div>
                      <div className="text-slate-600">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {job.expiresAt && (
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-slate-400 mt-0.5 mr-3" />
                      <div>
                        <div className="text-sm font-medium">Expires</div>
                        <div className="text-slate-600">
                          {new Date(job.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  {hasApplied ? (
                    <div className="text-center space-y-3">
                      <div className="flex items-center justify-center text-success font-medium">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Applied
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        asChild
                      >
                        <Link href="/applications">
                          View Your Applications
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleApply}
                      disabled={!user || applyMutation.isPending}
                    >
                      {applyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Apply Now
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Share card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-secondary mb-4">Share this job</h2>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" className="rounded-full">
                    <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <svg className="h-5 w-5 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.016 10.016 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" />
                    </svg>
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <svg className="h-5 w-5 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <svg className="h-5 w-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
