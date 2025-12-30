import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface CandidateFormData {
  email: string;
  name: string;
  phone: string;
}

interface CandidateFormFieldsProps {
  formData: CandidateFormData;
  onChange: (data: CandidateFormData) => void;
  idPrefix?: string;
  disabled?: boolean;
}

// Format phone number as user types: +91 98765 43210
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters except +
  let digits = value.replace(/[^\d+]/g, '');
  
  // Ensure + is only at the start
  if (digits.includes('+')) {
    const plusIndex = digits.indexOf('+');
    if (plusIndex > 0) {
      digits = digits.replace(/\+/g, '');
    }
  }
  
  // If no + at start and has digits, don't auto-add (let user add it)
  if (!digits.startsWith('+') && digits.length > 0) {
    // Just format the digits
    const cleaned = digits.replace(/\D/g, '');
    
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    } else {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7, 12)}`;
    }
  }
  
  // Handle number with country code (+)
  if (digits.startsWith('+')) {
    const withoutPlus = digits.slice(1).replace(/\D/g, '');
    
    if (withoutPlus.length <= 2) {
      return `+${withoutPlus}`;
    } else if (withoutPlus.length <= 7) {
      return `+${withoutPlus.slice(0, 2)} ${withoutPlus.slice(2)}`;
    } else {
      return `+${withoutPlus.slice(0, 2)} ${withoutPlus.slice(2, 7)} ${withoutPlus.slice(7, 12)}`;
    }
  }
  
  return digits;
};

const CandidateFormFields = ({ 
  formData, 
  onChange, 
  idPrefix = "candidate",
  disabled = false 
}: CandidateFormFieldsProps) => {
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange({ ...formData, phone: formatted });
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-email`}>Email *</Label>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          placeholder="candidate@email.com"
          value={formData.email}
          onChange={(e) => onChange({ ...formData, email: e.target.value })}
          required
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>Name *</Label>
        <Input
          id={`${idPrefix}-name`}
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => onChange({ ...formData, name: e.target.value })}
          required
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-phone`}>WhatsApp Number *</Label>
        <Input
          id={`${idPrefix}-phone`}
          type="tel"
          placeholder="+91 98765 43210"
          value={formData.phone}
          onChange={handlePhoneChange}
          required
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          Include country code for WhatsApp invite
        </p>
      </div>
    </>
  );
};

export default CandidateFormFields;
