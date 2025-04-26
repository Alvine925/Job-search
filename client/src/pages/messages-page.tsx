import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MessagesList from "@/components/messaging/MessagesList";
import MessageForm from "@/components/messaging/MessageForm";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getTimeAgo, getInitials, getCompanyInitials } from "@/lib/utils";
import { 
  Loader2, 
  MessageSquare, 
  User, 
  Building, 
  Clock, 
  ArrowLeft, 
  Circle,
  UserCircle
} from "lucide-react";

export default function MessagesPage() {
  const params = useParams<{ partnerId?: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  
  // Get all conversations
  const { 
    data: conversations, 
    isLoading: isLoadingConversations 
  } = useQuery({
    queryKey: ['/api/messages'],
    queryFn: async () => {
      if (!user) return [];
      const res = await apiRequest('GET', '/api/messages');
      return await res.json();
    },
    enabled: !!user,
  });
  
  // Get messages for the selected conversation
  const { 
    data: messages, 
    isLoading: isLoadingMessages 
  } = useQuery({
    queryKey: ['/api/messages', params.partnerId],
    queryFn: async () => {
      if (!user || !params.partnerId) return [];
      const res = await apiRequest('GET', `/api/messages/${params.partnerId}`);
      return await res.json();
    },
    enabled: !!user && !!params.partnerId,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
  
  // Get partner details if we have a partner ID
  const { 
    data: partnerProfile, 
    isLoading: isLoadingPartner 
  } = useQuery({
    queryKey: ['/api/profiles', params.partnerId],
    queryFn: async () => {
      if (!user || !params.partnerId) return null;
      
      // First find conversation to determine if partner is jobseeker or employer
      const conversation = conversations?.find(c => c.partnerId.toString() === params.partnerId);
      if (!conversation) return null;
      
      try {
        // Try to get job seeker profile
        const res = await apiRequest('GET', `/api/profiles/jobseeker/${params.partnerId}`);
        return await res.json();
      } catch (error) {
        try {
          // If not a job seeker, try to get company profile
          const res = await apiRequest('GET', `/api/profiles/company/${params.partnerId}`);
          return await res.json();
        } catch (innerError) {
          return null;
        }
      }
    },
    enabled: !!user && !!params.partnerId && !!conversations,
  });
  
  // Update selected conversation when partner ID changes
  useEffect(() => {
    if (params.partnerId && conversations) {
      const conversation = conversations.find(
        c => c.partnerId.toString() === params.partnerId
      );
      setSelectedConversation(conversation || null);
    } else {
      setSelectedConversation(null);
    }
  }, [params.partnerId, conversations]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user && !isLoadingConversations) {
      navigate("/auth");
    }
  }, [user, isLoadingConversations, navigate]);
  
  // Check if we have any loading state
  const isLoading = isLoadingConversations || (params.partnerId && (isLoadingMessages || isLoadingPartner));
  
  // Determine partner type and name
  const isPartnerJobSeeker = partnerProfile?.firstName !== undefined;
  const partnerName = isPartnerJobSeeker 
    ? `${partnerProfile?.firstName || ""} ${partnerProfile?.lastName || ""}` 
    : partnerProfile?.name || selectedConversation?.partnerName || "User";
  
  // Check if mobile view
  const isMobileView = typeof window !== "undefined" && window.innerWidth < 768;
  
  return (
    <>
      <Header />
      <DashboardLayout>
        <div className="w-full max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-secondary mb-6 flex items-center">
            <MessageSquare className="h-6 w-6 mr-2" />
            Messages
          </h1>
          
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:h-[600px] bg-white border rounded-lg shadow-sm overflow-hidden">
              {/* Conversations Sidebar */}
              {(!params.partnerId || !isMobileView) && (
                <div className="w-full md:w-1/3 border-r">
                  <div className="p-4 border-b">
                    <h2 className="font-semibold">Conversations</h2>
                  </div>
                  
                  {conversations && conversations.length > 0 ? (
                    <div className="overflow-y-auto h-[calc(100%-57px)]">
                      {conversations.map((conversation: any) => (
                        <button
                          key={conversation.partnerId}
                          className={`w-full text-left p-4 hover:bg-slate-50 transition focus:outline-none ${
                            selectedConversation?.partnerId === conversation.partnerId 
                              ? "bg-slate-100" 
                              : ""
                          }`}
                          onClick={() => navigate(`/messages/${conversation.partnerId}`)}
                        >
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={conversation.partnerAvatar} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {conversation.partnerName 
                                  ? (conversation.partnerName.includes(" ") 
                                      ? getInitials(conversation.partnerName.split(" ")[0], conversation.partnerName.split(" ")[1]) 
                                      : getCompanyInitials(conversation.partnerName))
                                  : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <h3 className="font-medium truncate">{conversation.partnerName}</h3>
                                <span className="text-xs text-slate-500">
                                  {conversation.latestMessage ? getTimeAgo(conversation.latestMessage.sentAt) : ""}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <p className="text-sm text-slate-500 truncate mr-1">
                                  {conversation.latestMessage?.content || "No messages yet"}
                                </p>
                                {conversation.unreadCount > 0 && (
                                  <Badge className="bg-primary text-white text-xs">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 h-[calc(100%-57px)]">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
                      <p className="text-slate-500 text-center mb-4">
                        Your conversations with employers and candidates will appear here.
                      </p>
                      <Button asChild variant="outline">
                        <a href="/jobs">Browse Jobs</a>
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Message View */}
              {params.partnerId ? (
                <div className="flex-1 flex flex-col h-full">
                  {/* Conversation Header */}
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center">
                      {isMobileView && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="mr-2"
                          onClick={() => navigate("/messages")}
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </Button>
                      )}
                      
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={partnerProfile?.avatarUrl || partnerProfile?.logoUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {isPartnerJobSeeker 
                            ? getInitials(partnerProfile?.firstName || "", partnerProfile?.lastName || "")
                            : getCompanyInitials(partnerProfile?.name || "")}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-medium">{partnerName}</h3>
                        <div className="flex items-center text-xs text-slate-500">
                          {isPartnerJobSeeker ? (
                            <>
                              <User className="h-3 w-3 mr-1" />
                              <span>{partnerProfile?.title || "Job Seeker"}</span>
                            </>
                          ) : (
                            <>
                              <Building className="h-3 w-3 mr-1" />
                              <span>{partnerProfile?.industry || "Company"}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex items-center text-xs text-slate-500 mr-2">
                        <Circle className="h-2 w-2 mr-1 fill-green-500 text-green-500" />
                        <span>Online</span>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={isPartnerJobSeeker ? "/jobs" : `/companies/${params.partnerId}`} target="_blank">
                          <UserCircle className="h-4 w-4 mr-1" />
                          View Profile
                        </a>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Messages List */}
                  <div className="flex-1 overflow-y-auto bg-slate-50">
                    <MessagesList 
                      messages={messages || []} 
                      partner={{
                        firstName: partnerProfile?.firstName,
                        lastName: partnerProfile?.lastName,
                        name: partnerProfile?.name,
                        avatarUrl: partnerProfile?.avatarUrl || partnerProfile?.logoUrl
                      }}
                      isLoading={isLoadingMessages}
                    />
                  </div>
                  
                  {/* Message Input */}
                  <MessageForm 
                    recipient={{ 
                      id: parseInt(params.partnerId),
                      applicationId: selectedConversation?.applicationId
                    }}
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 md:border-l bg-slate-50">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                    <p className="text-slate-500 mb-4">
                      Choose a conversation from the list to start messaging.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
      <Footer />
    </>
  );
}
