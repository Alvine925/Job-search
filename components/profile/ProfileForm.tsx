import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { X, Loader2, User, Plus } from "lucide-react";

// Form schema for job seeker profile
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  title: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  resumeUrl: z.string().optional(),
  avatarUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm({ existingProfile }: { existingProfile: any }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [skills, setSkills] = useState<string[]>(existingProfile?.skills || []);
  const [newSkill, setNewSkill] = useState("");
  
  // Form setup with existing data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: existingProfile?.firstName || "",
      lastName: existingProfile?.lastName || "",
      title: existingProfile?.title || "",
      bio: existingProfile?.bio || "",
      location: existingProfile?.location || "",
      resumeUrl: existingProfile?.resumeUrl || "",
      avatarUrl: existingProfile?.avatarUrl || "",
    },
  });
  
  // Create or update profile mutation
  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues & { skills: string[] }) => {
      if (existingProfile) {
        // Update existing profile
        return apiRequest('PUT', `/api/profiles/jobseeker/${existingProfile.id}`, data);
      } else {
        // Create new profile
        return apiRequest('POST', '/api/profiles/jobseeker', {
          ...data,
          userId: user?.id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles/jobseeker', user?.id] });
      toast({
        title: existingProfile ? "Profile updated" : "Profile created",
        description: existingProfile 
          ? "Your profile has been updated successfully." 
          : "Your profile has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${existingProfile ? 'update' : 'create'} profile: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Submit handler
  function onSubmit(values: ProfileFormValues) {
    profileMutation.mutate({ ...values, skills });
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
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and how you appear to employers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage 
                    src={form.watch("avatarUrl")} 
                    alt={`${form.watch("firstName")} ${form.watch("lastName")}`} 
                  />
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {getInitials(form.watch("firstName"), form.watch("lastName"))}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <FormField
                    control={form.control}
                    name="avatarUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Picture URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/avatar.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the URL of your profile picture. For best results, use a square image.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Senior Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Summary</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A brief summary of your professional experience and goals" 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel htmlFor="skills">Skills</FormLabel>
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
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter or click Add to add multiple skills
                </p>
              </div>
              
              <FormField
                control={form.control}
                name="resumeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resume URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/resume.pdf" {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Link to your resume or CV hosted online
                    </p>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="ml-auto" 
              disabled={profileMutation.isPending}
            >
              {profileMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {existingProfile ? 'Update Profile' : 'Create Profile'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
