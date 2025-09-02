import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export default async function Page() {
  await connectDB();
  const astrologers = await User.find({
    role: "astrologer",
    profileComplete: true,
  }).lean();
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {astrologers.map((a) => (
        <div key={a._id} className="border p-4 rounded">
          <h3 className="font-bold">{a.name || a.email}</h3>
          <p className="text-sm">{a.bio}</p>
          <p className="text-xs mt-2">
            Languages: {(a.languages || []).join(", ")}
          </p>
          <a
            className="mt-3 inline-block text-blue-600"
            href={`/astrologers/${a._id}`}
          >
            View profile
          </a>
        </div>
      ))}
    </div>
  );
}
