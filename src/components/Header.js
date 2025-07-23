'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';

const drawerItems = [
  {
    label: '🪐 Jyotish',
    slug: 'jyotish',
    subItems: [
      { label: '🧾 Kundali', href: '/jyotish/kundali' },
      { label: '❤️ Matchmaking', href: '/jyotish/matchmaking' },
      { label: '⏰ Muhurta', href: '/jyotish/muhurta' },
    ],
  },
  {
    label: '🕉️ Rituals',
    href: '/rituals',
  },
  {
    label: '✍️ Blog',
    href: '/blog',
  },
  {
    label: 'ℹ️ About',
    href: '/about',
  },
];

export default function Header() {
  const { data: session } = useSession();
  const drawerCheckboxRef = useRef(null);
  const [activeSubDrawer, setActiveSubDrawer] = useState(null);

  const handleCloseMainDrawer = () => {
    if (drawerCheckboxRef.current) {
      drawerCheckboxRef.current.checked = false;
    }
  };

  return (
    <header className='bg-base-100 border-b border-base-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          <div className='flex items-center'>
            <Link href='/' className='text-xl font-bold'>
              SriPatro
            </Link>
          </div>

          <div className='flex items-center space-x-2'>
            <label
              htmlFor='mobile-drawer'
              className='border border-base-300 bg-base-200 btn btn-sm rounded-md text-base-400'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16M4 18h16'
                />
              </svg>
            </label>
          </div>
        </div>
      </div>

      {/* Main Drawer */}
      <div className='drawer lg:hidden z-40'>
        <input id='mobile-drawer' ref={drawerCheckboxRef} type='checkbox' className='drawer-toggle' />
        <div className='drawer-content'></div>
        <div className='drawer-side'>
          <label htmlFor='mobile-drawer' className='drawer-overlay'></label>
          <aside className='menu p-4 w-80 min-h-full bg-base-100 text-base-content'>

            <div className='flex justify-between items-center mb-4'>
              <h1 className='pl-4 text-md'>SriPatro</h1>
              <label
                htmlFor='mobile-drawer'
                className='border border-base-300 bg-base-200 btn btn-sm rounded-md text-base-400'
              >
                ✕
              </label>
            </div>

            <ul className='menu space-y-1'>
              {drawerItems.map((item, index) => (
                <li key={index} className='border-b border-base-300'>
                  {!item.subItems ? (
                    <Link href={item.href} onClick={handleCloseMainDrawer}>
                      {item.label}
                    </Link>
                  ) : (
                    <div className='flex justify-between items-center'>
                      <span>{item.label}</span>
                      <label
                        htmlFor={`sub-drawer-${item.slug}`}
                        className='btn btn-sm btn-ghost'
                        onClick={() => setActiveSubDrawer(item.slug)}
                      >
                        ›
                      </label>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {/* Session block */}
            {session ? (
              <div className='py-4'>
                <p className='text-sm truncate'>{session.user?.email}</p>
                <details className='dropdown dropdown-end'>
                  <summary className='btn btn-ghost btn-sm'>•••</summary>
                  <ul className='menu dropdown-content bg-base-200 border rounded-md shadow w-40 z-10'>
                    <li><Link href='/dashboard'>Dashboard</Link></li>
                    <li onClick={() => signOut()}>Logout</li>
                    <li><Link href='https://sripatro.canny.io'>Suggest a Feature</Link></li>
                  </ul>
                </details>
              </div>
            ) : (
              <Link href='/auth/signin'>
                <button className='btn btn-sm bg-red-700 text-white'>LOGIN</button>
              </Link>
            )}
          </aside>
        </div>
      </div>

      {/* Sub-Drawers */}
      {drawerItems
        .filter(item => item.subItems)
        .map(item => (
          <div className='drawer drawer-end z-0' key={`sub-${item.slug}`}>
            <input id={`sub-drawer-${item.slug}`} type='checkbox' className='drawer-toggle' />
            <div className='drawer-content'></div>
            <div className='drawer-side w-72 bg-base-100 shadow-lg'>
              <label htmlFor={`sub-drawer-${item.slug}`} className='drawer-overlay'></label>
              <div className='menu p-4'>
                <div className='flex justify-between items-center mb-4'>
                  <h2 className='text-lg font-semibold'>{item.label}</h2>
                  <label
                    htmlFor={`sub-drawer-${item.slug}`}
                    className='btn btn-sm btn-outline'
                  >
                    ✕
                  </label>
                </div>
                <ul className='space-y-2'>
                  {item.subItems.map((subItem, subIndex) => (
                    <li key={subIndex}>
                      <Link
                        href={subItem.href}
                        onClick={() => {
                          document.getElementById(`sub-drawer-${item.slug}`).checked = false;
                          handleCloseMainDrawer();
                        }}
                      >
                        {subItem.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
    </header>
  );
}

