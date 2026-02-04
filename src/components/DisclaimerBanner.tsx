import { AlertTriangle } from "lucide-react";

interface DisclaimerBannerProps {
  compact?: boolean;
}

export function DisclaimerBanner({ compact = false }: DisclaimerBannerProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2">
        <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
        <span>For internal guidance only. Final decisions rest with management.</span>
      </div>
    );
  }

  return (
    <div className="disclaimer-banner">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground mb-1">Important Notice</p>
          <p className="text-sm text-muted-foreground">
            This information is for internal guidance only. Final decisions rest with management. 
            For legal or financial advice, please consult appropriate professionals.
          </p>
        </div>
      </div>
    </div>
  );
}
