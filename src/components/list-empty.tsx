import type { ReactNode } from "react";

/** Same empty treatment as the .NET leads table: icon, title, optional action. */
export function ListEmpty({
  title,
  icon = "fas fa-inbox",
  action,
}: {
  title: string;
  icon?: string;
  action?: ReactNode;
}) {
  return (
    <div className="clt-empty">
      <i className={icon} aria-hidden />
      <p>{title}</p>
      {action}
    </div>
  );
}
