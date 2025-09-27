import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Problem from "@/components/Problem";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import WithWithout from "@/components/WIthWithout";

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
          <p className="text-lg text-center  font-semibold text-base-800 mb-3">
            one stop place for astrology
          </p>
          <div className="flex justify-center">
            <Link href="/home">
              {" "}
              <button className="btn bg-red-600 text-white text-lg px-8 my-2 rounded-full font-extrabold">
                Get Started
              </button>
            </Link>
          </div>
          <div className="avatar-group -space-x-6 text-center justify-center my-4">
            <div className="avatar">
              <div className="w-12">
                <img src="https://img.daisyui.com/images/profile/demo/batperson@192.webp" />
              </div>
            </div>
            <div className="avatar">
              <div className="w-12">
                <img src="https://img.daisyui.com/images/profile/demo/spiderperson@192.webp" />
              </div>
            </div>
            <div className="avatar">
              <div className="w-12">
                <img src="https://img.daisyui.com/images/profile/demo/averagebulk@192.webp" />
              </div>
            </div>
            <div className="avatar avatar-placeholder">
              <div className="bg-neutral text-neutral-content w-12">
                <span>+99</span>
              </div>
            </div>
          </div>
          <h1 className="font-bold text-md text0-center">
            Loved By 123 Astrologers
          </h1>
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
      <Problem />
      <WithWithout />
      <Footer />
    </div>
  );
}
