export function Site00AdminHeader() {
  return (
    <header className="site00-admin-header">
      <input className="site00-admin-header__search" type="search" placeholder="SEARCH PROJECTS, CLIENTS, DELIVERABLES…" aria-label="Global search" />
      <div className="site00-admin-health" aria-label="Admin user">
        <span className="site00-admin-health__dot" aria-hidden="true" />
        <span>ADMIN</span>
      </div>
    </header>
  );
}
