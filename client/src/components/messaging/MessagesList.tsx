import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getTimeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface MessagesListProps {
  messages: any[];
  partner: any;
  isLoading: boolean;
}

export default function MessagesList({ messages, partner, isLoading }: MessagesListProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  // Generate initials for avatar fallback
  const getPartnerInitials = () => {
    if (!partner) return "?";
    
    if (partner.firstName && partner.lastName) {
      return `${partner.firstName[0]}${partner.lastName[0]}`.toUpperCase();
    } else if (partner.name) {
      const nameParts = partner.name.split(" ");
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      } else {
        return partner.name.substring(0, 2).toUpperCase();
      }
    }
    
    return "?";
  };
  
  // Group messages by date
  const groupMessagesByDate = () => {
    if (!messages || messages.length === 0) return [];
    
    const groups: { date: string; messages: any[] }[] = [];
    let currentDate = "";
    let currentGroup: any[] = [];
    
    messages.forEach((message) => {
      const messageDate = new Date(message.sentAt).toLocaleDateString();
      
      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }
    
    return groups;
  };
  
  // Format date for display
  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };
  
  const messageGroups = groupMessagesByDate();
  
  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4 p-4">
        <Skeleton className="h-10 w-40 mx-auto rounded-full" />
        
        <div className="space-y-4">
          <div className="flex items-start">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="ml-2 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-16 w-60 rounded-md" />
            </div>
          </div>
          
          <div className="flex items-start justify-end">
            <div className="mr-2 space-y-2 items-end">
              <Skeleton className="h-4 w-20 ml-auto" />
              <Skeleton className="h-12 w-48 rounded-md" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          
          <div className="flex items-start">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="ml-2 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-20 w-72 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No messages yet</h3>
          <p className="text-slate-500 mb-4">Start a conversation with {partner?.firstName || partner?.name || "this user"}.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col space-y-4 p-4 overflow-y-auto">
      {messageGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-4">
          <div className="flex justify-center">
            <Badge variant="outline" className="bg-slate-100 text-slate-600">
              {formatDateHeader(group.date)}
            </Badge>
          </div>
          
          {group.messages.map((message: any, index: number) => {
            const isCurrentUser = message.fromUserId === user?.id;
            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-start",
                  isCurrentUser ? "justify-end" : "justify-start"
                )}
              >
                {!isCurrentUser && (
                  <Avatar className="h-10 w-10 mr-2">
                    <AvatarImage src={partner?.avatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getPartnerInitials()}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={cn("max-w-[80%]", isCurrentUser ? "mr-2" : "ml-2")}>
                  <div
                    className={cn(
                      "p-3 rounded-lg",
                      isCurrentUser
                        ? "bg-primary text-white rounded-br-none"
                        : "bg-slate-100 text-slate-800 rounded-bl-none"
                    )}
                  >
                    {message.content}
                  </div>
                  
                  <div
                    className={cn(
                      "text-xs mt-1 text-slate-500",
                      isCurrentUser ? "text-right" : "text-left"
                    )}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{getTimeAgo(message.sentAt)}</span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          {new Date(message.sentAt).toLocaleString()}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                {isCurrentUser && (
                  <Avatar className="h-10 w-10 ml-2">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-white">
                      {user?.username ? user.username.slice(0, 2).toUpperCase() : "ME"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
        </div>
      ))}
      
      <div ref={messagesEndRef} />
    </div>
  );
}
