import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, getCompanyInitials } from "@/lib/utils";
import { Briefcase, MapPin, Clock, DollarSign } from "lucide-react";

interface JobCardProps {
  job: any;
  variant?: "default" | "compact";
  hideCompanyInfo?: boolean;
}

export default function JobCard({ job, variant = "default", hideCompanyInfo = false }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.id}`} className="block">
      <div className="job-card bg-white rounded-lg shadow p-6 border border-slate-200 cursor-pointer hover:shadow-md hover:translate-y-[-2px] transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start">
            {!hideCompanyInfo && job.company && (
              <Avatar className="h-12 w-12 rounded mr-3">
                <AvatarImage 
                  src={job.company.logoUrl} 
                  alt={job.company.name} 
                />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {job.company.name ? getCompanyInitials(job.company.name) : "CO"}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <Badge variant="outline" className={`text-primary bg-blue-100 border-0 ${variant === "compact" ? "text-xs" : ""}`}>
            {job.type}
          </Badge>
        </div>
        
        <h3 className={`${variant === "compact" ? "text-lg" : "text-xl"} font-semibold text-secondary mb-2`}>
          {job.title}
        </h3>
        
        {!hideCompanyInfo && job.company && (
          <p className="text-sm text-slate-500 mb-1">{job.company.name}</p>
        )}
        
        <p className="text-sm text-slate-500 mb-4 flex items-center">
          <MapPin className="h-4 w-4 mr-1 text-slate-400" />
          {job.location}
        </p>
        
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills.slice(0, 3).map((skill: string, index: number) => (
              <Badge key={index} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 3 && (
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                +{job.skills.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          {job.salary ? (
            <span className="text-primary font-semibold flex items-center">
              <DollarSign className="h-4 w-4 mr-0.5" />
              {job.salary}
            </span>
          ) : (
            <span className="text-slate-400 font-medium text-sm">Salary not specified</span>
          )}
          
          <span className="text-xs text-slate-500 flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Posted {formatDate(job.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
