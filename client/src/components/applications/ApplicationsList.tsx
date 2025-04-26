import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/utils";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Calendar, User, MessageSquare, ArrowRight } from "lucide-react";
import ApplicationStatus from "./ApplicationStatus";

interface ApplicationsListProps {
  applications: any[];
  type: "jobSeeker" | "employer";
  onStatusChange?: (applicationId: number, status: string) => void;
}

export default function ApplicationsList({ 
  applications, 
  type,
  onStatusChange
}: ApplicationsListProps) {
  const { user } = useAuth();
  
  if (!applications || applications.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Briefcase className="h-6 w-6 text-slate-400" />
          </div>
          
          <h3 className="text-lg font-medium mb-2">No applications found</h3>
          
          {type === "jobSeeker" ? (
            <>
              <p className="text-slate-500 mb-4">
                You haven't applied to any jobs yet. Start exploring job opportunities.
              </p>
              <Button asChild>
                <Link href="/jobs">Find Jobs</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="text-slate-500 mb-4">
                You don't have any applications to review yet. Post a job to attract candidates.
              </p>
              <Button asChild>
                <Link href="/post-job">Post a Job</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application.id} className="overflow-hidden">
          {type === "employer" && (
            <div className={`h-2 ${getStatusColor(application.status).bg}`}></div>
          )}
          <CardHeader className="pb-3">
            {type === "jobSeeker" ? (
              <div className="flex justify-between">
                <CardTitle className="text-xl">
                  {application.job?.title || "Job Title"}
                </CardTitle>
                <ApplicationStatus status={application.status} />
              </div>
            ) : (
              <div className="flex justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={application.jobSeeker?.avatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {application.jobSeeker?.firstName ? application.jobSeeker?.firstName[0] : ""}
                      {application.jobSeeker?.lastName ? application.jobSeeker?.lastName[0] : ""}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {application.jobSeeker?.firstName} {application.jobSeeker?.lastName}
                    </CardTitle>
                    <CardDescription>
                      {application.jobSeeker?.title || "Candidate"}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-start">
                  <Badge variant="outline" className="ml-2">
                    {formatDate(application.appliedAt)}
                  </Badge>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {type === "jobSeeker" ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={application.job?.company?.logoUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {application.job?.company?.name ? application.job?.company?.name.substring(0, 2).toUpperCase() : "CO"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{application.job?.company?.name}</span>
                </div>
                <div className="flex flex-wrap gap-y-2">
                  <div className="w-full md:w-1/2 flex items-center text-slate-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{application.job?.location || "Location"}</span>
                  </div>
                  <div className="w-full md:w-1/2 flex items-center text-slate-500">
                    <Briefcase className="h-4 w-4 mr-2" />
                    <span>{application.job?.type || "Job Type"}</span>
                  </div>
                  <div className="w-full md:w-1/2 flex items-center text-slate-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Applied on {formatDate(application.appliedAt)}</span>
                  </div>
                </div>
                
                {application.coverLetter && (
                  <div>
                    <div className="text-sm font-medium mb-1">Your Cover Letter:</div>
                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md">
                      {application.coverLetter.length > 150 
                        ? `${application.coverLetter.substring(0, 150)}...` 
                        : application.coverLetter}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-md">
                  <div className="text-sm font-medium mb-1">Applied for:</div>
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-slate-500" />
                    <span className="font-medium">{application.job?.title}</span>
                  </div>
                  <div className="flex items-center mt-1 text-slate-500 text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{application.job?.location}</span>
                  </div>
                </div>
                
                {application.coverLetter && (
                  <div>
                    <div className="text-sm font-medium mb-1">Cover Letter:</div>
                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md">
                      {application.coverLetter.length > 150 
                        ? `${application.coverLetter.substring(0, 150)}...` 
                        : application.coverLetter}
                    </div>
                  </div>
                )}
                
                {onStatusChange && (
                  <div>
                    <div className="text-sm font-medium mb-2">Update Status:</div>
                    <div className="flex flex-wrap gap-2">
                      {["pending", "reviewing", "interviewed", "offered", "rejected", "accepted"].map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={application.status === status ? "default" : "outline"}
                          onClick={() => onStatusChange(application.id, status)}
                          className={application.status === status ? getStatusColor(status).button : ""}
                        >
                          {capitalize(status)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {type === "jobSeeker" ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/messages/${application.job?.company?.id}`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Employer
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/jobs/${application.job?.id}`}>
                    View Job
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/messages/${application.jobSeeker?.id}`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Candidate
                  </Link>
                </Button>
                <Button variant="ghost" size="sm">
                  View Profile
                  <User className="h-4 w-4 ml-2" />
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// Utility functions
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getStatusColor(status: string): { bg: string; button: string } {
  switch (status) {
    case "pending":
      return { bg: "bg-slate-300", button: "bg-slate-600 hover:bg-slate-700" };
    case "reviewing":
      return { bg: "bg-blue-300", button: "bg-blue-600 hover:bg-blue-700" };
    case "interviewed":
      return { bg: "bg-purple-300", button: "bg-purple-600 hover:bg-purple-700" };
    case "offered":
      return { bg: "bg-amber-300", button: "bg-amber-600 hover:bg-amber-700" };
    case "rejected":
      return { bg: "bg-red-300", button: "bg-red-600 hover:bg-red-700" };
    case "accepted":
      return { bg: "bg-green-300", button: "bg-green-600 hover:bg-green-700" };
    default:
      return { bg: "bg-slate-300", button: "bg-slate-600 hover:bg-slate-700" };
  }
}
