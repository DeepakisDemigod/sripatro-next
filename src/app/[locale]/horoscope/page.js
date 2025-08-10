import HoroscopePredictions from "@/components/Horoscope/HoroscopePredictions.js";
import Header from "@/components/Header";
import Comments from "@/components/Comments/Comments";

export default function page() {
  return (
    <div>
      <Header />
      <h3 className="px-4 py-2 text-2xl font-semibold text-base-800 mb-6">
        Horoscope Predictions for All Signs
      </h3>
      <HoroscopePredictions />
      <Comments currentUserId={1} />
    </div>
  );
}
