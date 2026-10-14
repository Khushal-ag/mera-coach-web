/**
 * Shown before the coach session is known. It reuses the dashboard shell
 * classes so the sidebar and header do not jump when the real shell mounts.
 */
export function DashboardShellSkeleton() {
  return (
    <div className="mc-dash" aria-busy="true" aria-label="Loading dashboard">
      <div className="cl-body">
        <aside className="cl-sidebar">
          <div className="cl-brand">
            <div className="cl-brand-logo" />
            <div className="cl-brand-info">
              <span className="mc-skeleton-on-dark mc-skeleton block h-4 w-28" />
            </div>
          </div>
          <div className="cl-sidebar-divider" />
          <nav className="cl-nav">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="mc-skeleton-on-dark mc-skeleton mx-2 mb-2 h-10 rounded-xl"
              />
            ))}
          </nav>
        </aside>
        <div className="cl-main">
          <header className="cl-header">
            <div className="cl-header-welcome">
              <div className="mc-skeleton h-4 w-40" />
            </div>
            <div className="cl-header-right">
              <div className="mc-skeleton size-10 rounded-full" />
            </div>
          </header>
          <main className="cl-content">
            <div className="mc-skeleton mb-5 h-8 w-48 max-w-full" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="mc-skeleton h-32 rounded-2xl" />
              ))}
            </div>
            <div className="mc-skeleton mt-6 h-64 rounded-2xl" />
          </main>
        </div>
      </div>
    </div>
  );
}
