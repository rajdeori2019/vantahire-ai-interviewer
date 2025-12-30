import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

interface BrevoWebhookEvent {
  event: string;
  email: string;
  id?: number;
  date?: string;
  "message-id"?: string;
  reason?: string;
  tag?: string;
  ts_event?: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const events: BrevoWebhookEvent[] = await req.json();
    console.log("Received Brevo webhook events:", JSON.stringify(events));

    // Process each event
    for (const event of Array.isArray(events) ? events : [events]) {
      const messageId = event["message-id"];
      const eventType = event.event?.toLowerCase();
      const eventDate = event.date || new Date().toISOString();

      if (!messageId) {
        console.log("No message-id in event, skipping:", event);
        continue;
      }

      console.log(`Processing event: ${eventType} for message ${messageId}`);

      // Find the email record by message_id
      const { data: emailRecord, error: findError } = await supabaseAdmin
        .from("email_messages")
        .select("id")
        .eq("message_id", messageId)
        .maybeSingle();

      if (findError) {
        console.error("Error finding email record:", findError);
        continue;
      }

      if (!emailRecord) {
        console.log(`No email record found for message_id: ${messageId}`);
        continue;
      }

      // Update based on event type
      let updateData: Record<string, unknown> = {};

      switch (eventType) {
        case "delivered":
          updateData = {
            status: "delivered",
            delivered_at: eventDate,
          };
          break;
        case "opened":
        case "unique_opened":
          updateData = {
            status: "opened",
            opened_at: eventDate,
          };
          break;
        case "hard_bounce":
        case "soft_bounce":
          updateData = {
            status: "bounced",
            bounced_at: eventDate,
            error_message: event.reason || `${eventType}`,
          };
          break;
        case "blocked":
        case "invalid_email":
        case "error":
          updateData = {
            status: "failed",
            failed_at: eventDate,
            error_message: event.reason || eventType,
          };
          break;
        case "spam":
        case "complaint":
          updateData = {
            status: "spam",
            error_message: "Marked as spam by recipient",
          };
          break;
        case "unsubscribed":
          updateData = {
            status: "unsubscribed",
          };
          break;
        default:
          console.log(`Unhandled event type: ${eventType}`);
          continue;
      }

      const { error: updateError } = await supabaseAdmin
        .from("email_messages")
        .update(updateData)
        .eq("id", emailRecord.id);

      if (updateError) {
        console.error("Error updating email record:", updateError);
      } else {
        console.log(`Updated email ${emailRecord.id} with status: ${updateData.status}`);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing Brevo webhook:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
