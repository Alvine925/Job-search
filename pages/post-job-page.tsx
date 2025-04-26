import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DashboardLayout from "@/components/layout/DashboardLayout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, X, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";

// Form schema
const jobSchema = z.object({
  title: z.string().min(3, "Job title must be at least 3 characters"),
  location: z.string().min(3, "Location is required"),
  type: z.string().min(1, "Job type is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  salary: z.string().optional(),
  expiresAt: z.date().optional(),
});

type JobFormValues = z.infer<typeof jobSchema>;

export default function PostJobPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  
  // Check if user has company profile
  const { data: companyProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/profiles/company', user?.id],
    queryFn: async () => {
      if (!user) return null;
      try {
        const res = await apiRequest('GET', `/api/profiles/company/${user.id}`);
        return await res.json();
      } catch (error) {
        // If profile not found, return null but don't treat as error
        if (error.message.includes('404')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!user && user.userType === 'employer',
  });

  // Form setup
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      location: "",
      type: "",
      description: "",
      requirements: "",
      benefits: "",
      salary: "",
    },
  });

  // Job posting mutation
  const postJobMutation = useMutation({
    mutationFn: async (data: JobFormValues & { skills: string[] }) => {
      return apiRequest('POST', '/api/jobs', data);
    },
    onSuccess: () => {
      toast({
        title: "Job posted",
        description: "Your job has been posted successfully.",
      });
      // Redirect to manage jobs page
      navigate("/manage-jobs");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to post job: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Submit handler
  function onSubmit(values: JobFormValues) {
    // Add skills to the form data
    postJobMutation.mutate({ ...values, skills });
  }

  // Add a new skill
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  // Remove a skill
  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  // Handle Enter key in skill input
  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  // Redirect if user doesn't have a company profile
  useEffect(() => {
    if (!isLoadingProfile && user && user.userType === 'employer' && !companyProfile) {
      toast({
        title: "Profile required",
        description: "You need to create a company profile before posting jobs.",
        variant: "destructive",
      });
      navigate("/profile");
    }
  }, [companyProfile, isLoadingProfile, user, navigate, toast]);

  // Redirect if user is not an employer
  useEffect(() => {
    if (user && user.userType !== 'employer') {
      toast({
        title: "Access denied",
        description: "Only employers can post jobs.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, navigate, toast]);

  // Job type options
  const jobTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary",
    "Internship",
    "Remote"
  ];

  return (
    <>
      <Header />
      <DashboardLayout>
        <div className="w-full max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-secondary mb-6">Post a New Job</h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                  <CardDescription>
                    Provide information about the position you're hiring for
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Senior Software Engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. San Francisco, CA or Remote" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select job type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {jobTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary Range (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. $80K - $100K per year" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the role, responsibilities, and what a typical day looks like" 
                            className="min-h-[150px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requirements (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List the qualifications, experience, and skills needed for this role" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="benefits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Benefits (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the benefits, perks, and work culture" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel htmlFor="skills">Required Skills</FormLabel>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        id="skills"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={handleSkillKeyDown}
                        placeholder="Add a skill (e.g., React, Project Management)"
                      />
                      <Button type="button" variant="outline" onClick={addSkill}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Expiration Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full justify-start text-left font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>No expiration date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="ml-auto" 
                    disabled={postJobMutation.isPending}
                  >
                    {postJobMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Post Job
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>
      </DashboardLayout>
      <Footer />
    </>
  );
}
