import { cn } from "@/lib/utils";

type Tone = "error" | "success" | "info";

const toneClass: Record<Tone, string> = {
  error: "mc-banner mc-banner-error",
  success: "mc-banner mc-banner-success",
  info: "mc-banner mc-banner-info",
};

export function AlertBanner({
  tone = "info",
  children,
  className,
  role,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  role?: "alert" | "status";
}) {
  return (
    <div
      role={role ?? (tone === "error" ? "alert" : "status")}
      className={cn(toneClass[tone], className)}
    >
      {children}
    </div>
  );
}
