import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/home/HeroBanner";
import FeaturedJobs from "@/components/home/FeaturedJobs";
import UserTypeSwitcher from "@/components/home/UserTypeSwitcher";
import CategorySection from "@/components/home/CategorySection";
import TestimonialSection from "@/components/home/TestimonialSection";
import CTASection from "@/components/home/CTASection";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function HomePage() {
  const { user } = useAuth();

  // Load featured jobs
  const { data: featuredJobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['/api/jobs'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/jobs');
      return await res.json();
    },
    staleTime: 60000, // 1 minute
  });

  return (
    <>
      <Header />
      <main>
        <HeroBanner />
        <FeaturedJobs jobs={featuredJobs || []} isLoading={isLoadingJobs} />
        <UserTypeSwitcher />
        <CategorySection />
        <TestimonialSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
