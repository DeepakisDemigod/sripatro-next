import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export default async function Page() {
  await connectDB();
  const astrologers = await User.find({
    role: "astrologer",
    profileComplete: true,
  }).lean();
  return (
    <div className="p-8 min-h-screen bg-base-200">
      <h1 className="text-3xl font-bold text-center text-red-600 mb-8">
        Astrologers
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {astrologers.map((a) => (
          <div
            key={a._id}
            className="card bg-base-100 shadow-lg border border-red-600 rounded-xl p-6 flex flex-col items-start"
          >
            <h3 className="font-bold text-xl text-red-600 mb-1">
              {a.name || a.email}
            </h3>
            <p className="text-sm mb-2 text-gray-700">{a.bio}</p>
            <p className="text-xs mb-2 text-gray-500">
              <span className="font-semibold">Languages:</span>{" "}
              {(a.languages || []).join(", ")}
            </p>
            <a
              className="btn btn-outline btn-error border-red-600 text-red-600 mt-auto"
              href={`/astrologers/${a._id}`}
            >
              View profile
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
