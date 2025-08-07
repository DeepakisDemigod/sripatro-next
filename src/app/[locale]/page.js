import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <div>
      <Header />
      <div>
        <div className="max-w-2xl mx-auto p-6 bg-base-100 shadow-lg rounded-2xl">
          <h1 className="text-6xl font-bold text-base-900 mb-4 text-center">
            Best Free Software for Nepali Astrologers
          </h1>
          <p className="text-lg font-semibold text-neutral mb-3">
            What's included:
          </p>
          <ul className="list-none space-y-2 text-base text-base-content">
            {[
              "Live Panchang",
              "Date Converter",
              "Ishwi Sambat Birth Panchang (AD)",
              "Bikram Sambat Birth Panchang (BS)",
              "Birth Kundali (AD)",
              "Nepali Cheena",
              "...and much more",
            ].map((item, index) => (
              <li key={index} className="flex items-center">
                <svg
                  className="w-5 h-5 text-white bg-green-600 rounded-full p-1 mr-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}
