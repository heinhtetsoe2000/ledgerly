export default function RootLoading() {
  return (
    <main aria-label="Loading your workspace" className="workspace-loading" role="status">
      <div aria-hidden="true" className="workspace-loading-brand">
        <span className="workspace-loading-mark" />
        <span>Ledgerly</span>
      </div>
      <div aria-hidden="true" className="workspace-loading-content">
        <div className="loading-line loading-title" />
        <div className="loading-line loading-description" />
        <div className="workspace-loading-summary">
          <div className="loading-panel" />
        </div>
        <div className="workspace-loading-list">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="workspace-loading-row" key={index}>
              <span className="workspace-loading-icon" />
              <span className="workspace-loading-item-copy">
                <span className="loading-line workspace-loading-item-title" />
                <span className="loading-line workspace-loading-item-description" />
              </span>
              <span className="loading-line workspace-loading-amount" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}