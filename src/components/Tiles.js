'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Slider = dynamic(() => import('react-slick'), {
  ssr: false,
});

const tiles = [
  { label: 'Panchang', icon: '🇳🇵', tag: 'BS', href: '/nepalitoenglish' },
  { label: 'Panchang', icon: ' 🇮🇳', tag: 'AD', href: '/birthpanchang' },
  { label: 'Kundali', icon: '🪐', tag: 'AD', href: '/kundali' },
  { label: 'Horoscope', icon: '🐏', tag: 'AD', href: '/horoscope' },
  { label: 'Cheena', icon: '🧧', tag: 'AD', href: '/nepali-cheena' },
  { label: 'Date Converter', icon: '🗓', tag: 'BS', href: '/date-converter' },
];

const Tiles = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 500); // simulate loading
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
    autoplaySpeed: 2000,
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
      <div className="text-base-content py-2">
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 bg-base-100 rounded-xl shadow"
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
    <div className="text-base-content py-2">
      <Slider {...settings}>
        {tiles.map(({ label, icon, tag, href }) => (
          <div key={href} className="px-1">
            <a
              href={href}
              className="flex items-center justify-between p-2 bg-base-100 rounded-xl shadow hover:shadow-md transition duration-200 hover:bg-base-50"
            >
              <div className="flex items-center gap-4 pl-4">
                <div className="text-4xl bg-base-200 p-2 rounded-xl">{icon}</div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">{tag}</div>
                  <div className="text-md font-semibold">{label}</div>
                </div>
              </div>
            </a>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Tiles;
