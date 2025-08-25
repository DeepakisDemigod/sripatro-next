import Link from "next/link";

const Tools = () => {
  return (
    <div className=" text-base-900 text-left">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Jyotish</h3>
        <ol className="text-sm list-none pl-0 border-l border-l-8 border-l-red-600">
          <li>
            <Link
              href="/"
              className="transition-colors duration-200 block hover:underline flex  px-4  focus:outline-none focus:ring-2  focus:ring-opacity-50"
            >
              Panchang Today (Live)
            </Link>
          </li>
          <li>
            <Link
              href="/date-converter"
              className="transition-colors duration-200 block hover:underline flex  px-4  focus:outline-none focus:ring-2  focus:ring-opacity-50"
            >
              Date Converter
            </Link>
          </li>
          <li>
            <Link
              href="/birthpanchang"
              className="transition-colors duration-200 block hover:underline flex  px-4  focus:outline-none focus:ring-2  focus:ring-opacity-50"
            >
              Birth Panchang (AD)
            </Link>
          </li>
          <li>
            <Link
              href="/nepalitoenglish"
              className="transition-colors duration-200 block hover:underline flex  px-4  focus:outline-none focus:ring-2  focus:ring-opacity-50"
            >
              Bikram Sambat to Panchang (BS)
            </Link>
          </li>
          <li>
            <Link
              href="/kundali"
              className="transition-colors duration-200 block hover:underline flex  px-4  focus:outline-none focus:ring-2  focus:ring-opacity-50"
            >
              Birth Kundali (AD)
            </Link>
          </li>
        </ol>
        <br />

        <h3 className="text-lg font-semibold mb-4">Horoscope</h3>
        <ul className="text-sm list-none pl-0 border-l border-l-[4px] border-l-red-500">
          <li>
            <Link
              href="/horoscope"
              className="transition-colors duration-200 block hover:underline flex  px-4  focus:outline-none focus:ring-2  focus:ring-opacity-50"
            >
              Daily Horoscope
            </Link>
          </li>
          <li>
            <Link
              href="/horoscope"
              className="transition-colors duration-200 block hover:underline flex  px-4  focus:outline-none focus:ring-2  focus:ring-opacity-50"
            >
              Weekly Horoscope
            </Link>
          </li>
          <li>
            <Link
              href="/horoscope"
              className="transition-colors duration-200 block hover:underline flex  px-4  focus:outline-none focus:ring-2  focus:ring-opacity-50"
            >
              Monthly Horoscope
            </Link>
          </li>
        </ul>

        <br />

        <h3 className="text-lg font-semibold mb-4">Help</h3>
        <ul className="text-sm list-none pl-0 border-l border-l-[4px] border-l-red-500">
          <li>
            <Link
              href="/settings"
              className="transition-colors duration-200 block hover:underline flex  px-4  focus:outline-none focus:ring-2  focus:ring-opacity-50"
            >
              Settings
            </Link>
          </li>
        </ul>

        <br />
        <a
          href="https://www.producthunt.com/products/sri-patro/reviews?utm_source=badge-product_review&utm_medium=badge&utm_souce=badge-sri&#0045;patro"
          target="_blank"
        >
          <img
            src="https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=864650&theme=light"
            alt="Sri&#0032;Patro - Best&#0032;Nepali&#0032;and&#0032;English&#0032;Calender&#0032;forAccurate&#0032;Hourly&#0032;Panchang | Product Hunt"
            style={{ width: "100vw", height: "54px" }}
          />
        </a>
      </div>
    </div>
  );
};

export default Tools;
