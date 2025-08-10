import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link"

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <div>
      <Header />
      <div>
        <div className="max-w-2xl mx-auto p-6 bg-base-100 shadow-lg rounded-2xl">
          <h1 className="text-5xl font-bold text-base-900 mb-4 text-center">
            Free Software for Nepali Astrologers
          </h1>
          <p className="text-lg font-semibold text-base-800 mb-3">
           one stop place for every astrology info
          </p>
<div className="flex justify-center">
	 <Link href="/home"> <button className="btn bg-red-600 text-white text-lg px-8 my-2 rounded font-extrabold">Try Tools Now</button></Link>
	  </div>
          <ul className="list-none space-y-2 text-base text-base-content px-6">
            {[
              "Live Panchang",
              "Date Converter (BS⇄AD)",
              "Birth Panchang (AD, BS)",
              "Birth Kundali (AD)",
              "Nepali Cheena (Panchang + Dasha)",
              "and much more...",
            ].map((item, index) => (
              <li key={index} className="flex items-center">
                <svg
                  className="w-6 h-6 text-white bg-green-600 rounded-full p-1 mr-2"
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
                <span className="font-bold">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}
