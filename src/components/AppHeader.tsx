import { Link } from "react-router-dom";
import { ReactNode } from "react";
import { Shield } from "lucide-react";

interface AppHeaderProps {
  /** Optional right-side content (user info, job status, timer, etc.) */
  rightContent?: ReactNode;
  /** Whether the logo should link to home (default: true) */
  linkToHome?: boolean;
  /** Whether to show admin badge */
  isAdmin?: boolean;
}

const AppHeader = ({ rightContent, linkToHome = true, isAdmin = false }: AppHeaderProps) => {
  const LogoContent = (
    <div className="flex items-center gap-2">
      <img 
        src="/vantahire-logo-2026.jpg" 
        alt="Vantahire" 
        className="w-9 h-9 rounded-lg object-cover"
      />
      <span className="text-xl font-bold text-foreground">Vantahire AI Interview</span>
    </div>
  );

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {linkToHome ? (
            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              {LogoContent}
            </Link>
          ) : (
            LogoContent
          )}

          {isAdmin && (
            <Link 
              to="/admin" 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Admin</span>
            </Link>
          )}
        </div>

        {rightContent && (
          <div className="flex items-center gap-4">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
