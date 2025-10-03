import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export default async function Page({ params }) {
  await connectDB();
  const astro = await User.findById(params.id).lean();
  if (!astro)
    return (
      <div className="p-8 text-center text-red-600 text-xl">Not found</div>
    );
  return (
    <div className="p-8 min-h-screen bg-base-200 flex flex-col items-center">
      <div className="card bg-base-100 shadow-lg border border-red-600 rounded-xl p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-red-600 mb-2">
          {astro.name || astro.email}
        </h1>
        <p className="mb-4 text-gray-700">{astro.bio}</p>
        <h3 className="mt-4 font-semibold text-lg text-red-600">Services</h3>
        {(astro.services || []).length === 0 && (
          <div className="text-gray-500">No services listed.</div>
        )}
        {(astro.services || []).map((s, i) => (
          <div
            key={i}
            className="border border-red-200 bg-base-200 p-4 my-3 rounded-lg"
          >
            <h4 className="font-bold text-red-600 text-lg mb-1">
              {s.title} - <span className="text-black">₹{s.price}</span>
            </h4>
            <p className="mb-2 text-gray-700">{s.description}</p>
            <p className="text-sm text-gray-500">
              Booking is currently unavailable. Please reach out via the
              feedback form if you need assistance.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
