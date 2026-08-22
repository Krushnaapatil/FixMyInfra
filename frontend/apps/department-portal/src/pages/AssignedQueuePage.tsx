export default function AssignedQueuePage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Assigned complaints</h1>
      <p className="text-gray-600">
        Wire this up to GET /api/complaints/assigned via React Query.
        Requires OFFICER role JWT claim.
      </p>
    </div>
  );
}
