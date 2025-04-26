import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface MessageFormProps {
  recipient: {
    id: number;
    applicationId?: number;
  };
}

export default function MessageForm({ recipient }: MessageFormProps) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  
  const messageMutation = useMutation({
    mutationFn: async (content: string) => {
      const data = {
        toUserId: recipient.id,
        content,
        relatedToApplicationId: recipient.applicationId,
      };
      
      return apiRequest('POST', '/api/messages', data);
    },
    onSuccess: () => {
      // Clear the form
      setMessage("");
      
      // Invalidate queries to refresh the messages list
      queryClient.invalidateQueries({ queryKey: ['/api/messages', recipient.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      
      // Optional toast notification
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim()) {
      messageMutation.mutate(message.trim());
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex flex-col space-y-2">
        <Textarea
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[80px] resize-none"
        />
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="flex items-center"
            disabled={!message.trim() || messageMutation.isPending}
          >
            {messageMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send
          </Button>
        </div>
      </div>
    </form>
  );
}
