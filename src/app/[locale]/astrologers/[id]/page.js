import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import BookingForm from "@/components/BookingForm";

export default async function Page({ params }) {
  await connectDB();
  const astro = await User.findById(params.id).lean();
  if (!astro) return <div>Not found</div>;
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{astro.name || astro.email}</h1>
      <p>{astro.bio}</p>
      <h3 className="mt-4 font-semibold">Services</h3>
      {(astro.services || []).map((s, i) => (
        <div key={i} className="border p-3 my-2">
          <h4>
            {s.title} - ₹{s.price}
          </h4>
          <p>{s.description}</p>
          <BookingForm
            astrologerId={astro._id}
            service={s}
            astrologerEmail={astro.email}
          />
        </div>
      ))}
    </div>
  );
}
