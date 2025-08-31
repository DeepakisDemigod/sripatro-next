"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const Slider = dynamic(() => import("react-slick"), {
  ssr: false,
});

const tiles = [
  { label: "Daily Panchang", icon: "🗓️", tag: "AD", href: "/daily-panchang" },
  { label: "Kundali", icon: "🪐", tag: "AD", href: "/kundali" },
  { label: "Horoscope", icon: "🐏", tag: "AD", href: "/horoscope" },
  { label: "Cheena", icon: "🧧", tag: "AD", href: "/nepali-cheena" },
{ label: "Shubh Saita", icon: "🪔", tag: "AD", href: "/shubh-saita" },
  {
    label: "Date Converter",
    icon: "🗓",
    tag: "BS",
    href: "/nepali-date-converter",
  },
{
    label: "Weather",
    icon: "🌪️",
    tag: "AD",
    href: "/weather",
  },
{
    label: "Settings",
    icon: "⚙️",
    tag: "AD",
    href: "/settings",
  },

];

const Tiles = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 700,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 1400,
    responsive: [
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto my-1  p-4 ">
        <div className="space-y-2 ">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 bg-base-100 rounded-xl shadow text-base-content py-2 border border-base-300 rounded"
            >
              <div className="flex items-center gap-4 pl-4">
                <div className="skeleton w-14 h-14 rounded-xl" />
                <div className="space-y-2">
                  <div className="skeleton h-3 w-12 rounded" />
                  <div className="skeleton h-4 w-24 rounded" />
                </div>
              </div>
              <div className="pr-2">
                <div className="skeleton h-10 w-14 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-base-content max-w-3xl mx-auto mx-3 ">
      <Slider {...settings}>
        {tiles.map(({ label, icon, tag, href }) => (
          <div key={href} className="">
            <a
              href={href}
              className="flex items-center justify-between p-2 bg-base-100 border border-base-300 rounded-xl shadow hover:shadow-md transition duration-200 hover:bg-base-50"
            >
              <div className="flex items-center gap-4 px-2">
                <div className="text-4xl bg-base-200 p-2 rounded-xl">
                  {icon}
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">{tag}</div>
                  <div className="text-md font-semibold">{label}</div>
                </div>
              </div>
              <div className="">
                {" "}
                <img
                  width={50}
                  src="https://i.ibb.co/tMMjhW4g/1000052219-removebg-preview.png"
                />
              </div>
            </a>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Tiles;
