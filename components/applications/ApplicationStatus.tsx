import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Search, 
  Users, 
  Award, 
  XCircle, 
  CheckCircle 
} from "lucide-react";

interface ApplicationStatusProps {
  status: string;
  size?: "sm" | "md" | "lg";
}

export default function ApplicationStatus({ 
  status, 
  size = "md" 
}: ApplicationStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          icon: <Clock className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />,
          className: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
        };
      case "reviewing":
        return {
          label: "Reviewing",
          icon: <Search className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />,
          className: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
        };
      case "interviewed":
        return {
          label: "Interviewed",
          icon: <Users className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />,
          className: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200"
        };
      case "offered":
        return {
          label: "Offered",
          icon: <Award className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />,
          className: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"
        };
      case "rejected":
        return {
          label: "Rejected",
          icon: <XCircle className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />,
          className: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
        };
      case "accepted":
        return {
          label: "Accepted",
          icon: <CheckCircle className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />,
          className: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
        };
      default:
        return {
          label: "Unknown",
          icon: <Clock className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />,
          className: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
        };
    }
  };
  
  const config = getStatusConfig();
  
  return (
    <Badge 
      variant="outline" 
      className={`flex items-center ${config.className} ${
        size === "sm" ? "text-xs px-2 py-0" : "px-2.5 py-0.5"
      }`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}
