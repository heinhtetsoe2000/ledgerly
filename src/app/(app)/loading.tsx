export default function ApplicationLoading() {
  return (
    <div aria-label="Loading page" className="loading-layout" role="status">
      <span className="sr-only">Loading page</span>
      <div aria-hidden="true" className="loading-line loading-title" />
      <div aria-hidden="true" className="loading-line loading-description" />
      <div aria-hidden="true" className="loading-panel" />
      <div aria-hidden="true" className="loading-panel loading-panel-short" />
    </div>
  );
}