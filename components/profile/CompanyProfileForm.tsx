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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCompanyInitials } from "@/lib/utils";
import { Loader2, Building } from "lucide-react";

// Form schema for company profile
const companyProfileSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  description: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  logoUrl: z.string().optional(),
  size: z.string().optional(),
});

type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;

export default function CompanyProfileForm({ existingProfile }: { existingProfile: any }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Form setup with existing data
  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      name: existingProfile?.name || "",
      description: existingProfile?.description || "",
      industry: existingProfile?.industry || "",
      location: existingProfile?.location || "",
      website: existingProfile?.website || "",
      logoUrl: existingProfile?.logoUrl || "",
      size: existingProfile?.size || "",
    },
  });
  
  // Create or update profile mutation
  const profileMutation = useMutation({
    mutationFn: async (data: CompanyProfileFormValues) => {
      if (existingProfile) {
        // Update existing profile
        return apiRequest('PUT', `/api/profiles/company/${existingProfile.id}`, data);
      } else {
        // Create new profile
        return apiRequest('POST', '/api/profiles/company', {
          ...data,
          userId: user?.id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles/company', user?.id] });
      toast({
        title: existingProfile ? "Company profile updated" : "Company profile created",
        description: existingProfile 
          ? "Your company profile has been updated successfully." 
          : "Your company profile has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${existingProfile ? 'update' : 'create'} company profile: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Submit handler
  function onSubmit(values: CompanyProfileFormValues) {
    profileMutation.mutate(values);
  }
  
  // Company size options
  const companySizes = [
    { value: "1-10", label: "1-10 employees" },
    { value: "11-50", label: "11-50 employees" },
    { value: "51-200", label: "51-200 employees" },
    { value: "201-500", label: "201-500 employees" },
    { value: "501-1000", label: "501-1000 employees" },
    { value: "1001+", label: "1001+ employees" },
  ];
  
  // Industry options
  const industries = [
    "Technology", "Finance", "Healthcare", "Education", "Retail", 
    "Manufacturing", "Marketing", "Design", "Entertainment", "Hospitality",
    "Real Estate", "Legal", "Consulting", "Non-profit", "Transportation"
  ];
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Company Profile</CardTitle>
            <CardDescription>
              Create your company profile to attract the best talent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage 
                    src={form.watch("logoUrl")} 
                    alt={form.watch("name")} 
                  />
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {getCompanyInitials(form.watch("name"))}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Logo URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/logo.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the URL of your company logo. For best results, use a square image.
                  </p>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        <Input placeholder="San Francisco, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Size</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companySizes.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
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
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
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
                    <FormLabel>Company Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell potential candidates about your company, mission, and culture" 
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
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
              {existingProfile ? 'Update Company Profile' : 'Create Company Profile'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
