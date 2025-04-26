import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProfileForm from "@/components/profile/ProfileForm";
import CompanyProfileForm from "@/components/profile/CompanyProfileForm";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasProfile, setHasProfile] = useState(false);
  
  // Get the appropriate profile based on user type
  const { data: profile, isLoading } = useQuery({
    queryKey: [user?.userType === 'jobSeeker' ? '/api/profiles/jobseeker' : '/api/profiles/company', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const endpoint = user.userType === 'jobSeeker' 
        ? `/api/profiles/jobseeker/${user.id}`
        : `/api/profiles/company/${user.id}`;
        
      try {
        const res = await apiRequest('GET', endpoint);
        return await res.json();
      } catch (error) {
        // If profile not found, return null but don't treat as error
        if (error.message.includes('404')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!user,
  });
  
  // Set hasProfile based on query result
  useEffect(() => {
    setHasProfile(!!profile);
  }, [profile]);
  
  if (!user) {
    return (
      <>
        <Header />
        <main className="bg-slate-50 min-h-screen py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-secondary mb-4">Please Sign In</h2>
              <p className="text-muted-foreground mb-8">You need to be signed in to view your profile.</p>
              <Button asChild>
                <a href="/auth">Sign In</a>
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
      <DashboardLayout>
        <div className="w-full max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-secondary mb-6">
            {hasProfile ? 'Edit Profile' : 'Create Your Profile'}
          </h1>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {user.userType === 'jobSeeker' ? (
                <ProfileForm existingProfile={profile} />
              ) : (
                <CompanyProfileForm existingProfile={profile} />
              )}
            </>
          )}
        </div>
      </DashboardLayout>
      <Footer />
    </>
  );
}
