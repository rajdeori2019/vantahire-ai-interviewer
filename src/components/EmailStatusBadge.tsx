import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Mail, CheckCircle, Eye, AlertTriangle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

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

interface EmailStatusBadgeProps {
  emailMessage: EmailMessage | null;
  loading?: boolean;
}

const EmailStatusBadge = ({ emailMessage, loading }: EmailStatusBadgeProps) => {
  if (loading) {
    return (
      <Badge variant="outline" className="text-muted-foreground border-muted">
        <Clock className="w-3 h-3 mr-1 animate-pulse" />
        Loading...
      </Badge>
    );
  }

  if (!emailMessage) {
    return (
      <Badge variant="outline" className="text-muted-foreground border-muted">
        <Mail className="w-3 h-3 mr-1" />
        No email
      </Badge>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "sent":
        return {
          icon: Mail,
          label: "Sent",
          color: "bg-blue-500/10 text-blue-600 border-blue-200",
          description: "Email sent to server",
        };
      case "delivered":
        return {
          icon: CheckCircle,
          label: "Delivered",
          color: "bg-green-500/10 text-green-600 border-green-200",
          description: "Email delivered to inbox",
        };
      case "opened":
        return {
          icon: Eye,
          label: "Opened",
          color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
          description: "Recipient opened the email",
        };
      case "bounced":
        return {
          icon: AlertTriangle,
          label: "Bounced",
          color: "bg-amber-500/10 text-amber-600 border-amber-200",
          description: emailMessage.error_message || "Email bounced",
        };
      case "failed":
        return {
          icon: XCircle,
          label: "Failed",
          color: "bg-red-500/10 text-red-600 border-red-200",
          description: emailMessage.error_message || "Email failed to send",
        };
      case "spam":
        return {
          icon: AlertTriangle,
          label: "Spam",
          color: "bg-red-500/10 text-red-600 border-red-200",
          description: "Marked as spam by recipient",
        };
      default:
        return {
          icon: Mail,
          label: status,
          color: "bg-muted text-muted-foreground border-muted",
          description: "Unknown status",
        };
    }
  };

  const config = getStatusConfig(emailMessage.status);
  const Icon = config.icon;

  const getTimestamp = () => {
    if (emailMessage.opened_at) {
      return `Opened ${format(new Date(emailMessage.opened_at), "MMM d, h:mm a")}`;
    }
    if (emailMessage.delivered_at) {
      return `Delivered ${format(new Date(emailMessage.delivered_at), "MMM d, h:mm a")}`;
    }
    if (emailMessage.bounced_at) {
      return `Bounced ${format(new Date(emailMessage.bounced_at), "MMM d, h:mm a")}`;
    }
    if (emailMessage.failed_at) {
      return `Failed ${format(new Date(emailMessage.failed_at), "MMM d, h:mm a")}`;
    }
    return `Sent ${format(new Date(emailMessage.sent_at), "MMM d, h:mm a")}`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`cursor-help ${config.color}`}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">Email: {config.description}</p>
            <p className="text-xs text-muted-foreground">{getTimestamp()}</p>
            <p className="text-xs text-muted-foreground truncate">
              To: {emailMessage.recipient_email}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EmailStatusBadge;
