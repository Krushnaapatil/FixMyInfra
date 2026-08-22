export default function OverviewPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard overview</h1>
      <p className="text-gray-600">
        Wire this up to GET /api/reports/summary - complaint trends,
        department workload, issue hotspots, resolution stats.
      </p>
    </div>
  );
}
