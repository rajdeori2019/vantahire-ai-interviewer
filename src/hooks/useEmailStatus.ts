import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EmailMessage {
  id: string;
  interview_id: string;
  recipient_email: string;
  status: string;
  sent_at: string;
  delivered_at: string | null;
  opened_at: string | null;
  bounced_at: string | null;
  failed_at: string | null;
  error_message: string | null;
}

export const useEmailStatus = (interviewIds: string[]) => {
  const [emailMessages, setEmailMessages] = useState<Record<string, EmailMessage>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (interviewIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchEmailMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("email_messages")
        .select("*")
        .in("interview_id", interviewIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching email messages:", error);
        setLoading(false);
        return;
      }

      // Group by interview_id, keeping the latest message for each
      const messageMap: Record<string, EmailMessage> = {};
      data?.forEach((msg) => {
        if (!messageMap[msg.interview_id]) {
          messageMap[msg.interview_id] = msg as EmailMessage;
        }
      });

      setEmailMessages(messageMap);
      setLoading(false);
    };

    fetchEmailMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel("email-status-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "email_messages",
          filter: `interview_id=in.(${interviewIds.join(",")})`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newMessage = payload.new as EmailMessage;
            setEmailMessages((prev) => ({
              ...prev,
              [newMessage.interview_id]: newMessage,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [interviewIds.join(",")]);

  return { emailMessages, loading };
};
