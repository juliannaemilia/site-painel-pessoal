import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  fullName: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

export function Avatar({ fullName, avatarUrl, size = "md", className }: AvatarProps): JSX.Element {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={fullName}
        className={cn("rounded-full object-cover", sizeClasses[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground",
        sizeClasses[size],
        className
      )}
      aria-hidden="true"
    >
      {getInitials(fullName)}
    </div>
  );
}
