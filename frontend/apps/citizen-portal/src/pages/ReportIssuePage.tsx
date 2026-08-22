export default function ReportIssuePage() {
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Report an issue</h1>
      <p className="text-gray-600">
        Upload a photo, pin the location, and add an optional description.
        Wire this up to POST /api/complaints via @fixmyinfra/api-client.
      </p>
    </div>
  );
}
