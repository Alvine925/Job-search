import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function CTASection() {
  const { user } = useAuth();
  
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Take the Next Step in Your Career?</h2>
        <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
          Join thousands of professionals who have found their dream jobs through JobMatch. 
          Create your profile today and start your journey to career success.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {user ? (
            <>
              {user.userType === "jobSeeker" ? (
                <>
                  <Button asChild className="bg-white hover:bg-slate-100 text-primary font-semibold">
                    <Link href="/jobs">Find Jobs</Link>
                  </Button>
                  <Button asChild className="bg-transparent hover:bg-blue-700 text-white border border-white">
                    <Link href="/profile">Update Profile</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild className="bg-white hover:bg-slate-100 text-primary font-semibold">
                    <Link href="/post-job">Post a Job</Link>
                  </Button>
                  <Button asChild className="bg-transparent hover:bg-blue-700 text-white border border-white">
                    <Link href="/applications">Manage Applications</Link>
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <Button asChild className="bg-white hover:bg-slate-100 text-primary font-semibold">
                <Link href="/auth?tab=register&type=jobSeeker">Create Your Profile</Link>
              </Button>
              <Button asChild className="bg-transparent hover:bg-blue-700 text-white border border-white">
                <Link href="/auth?tab=register&type=employer">For Employers</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
