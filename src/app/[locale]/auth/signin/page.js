'use client';

import ThemeSwitcher from '@/components/ThemeSwitcher';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SignIn() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    await signIn('email', { email });
    setLoading(false);
  };

  return (
    <div className='flex justify-center items-center h-screen'>
      <form
        onSubmit={handleSubmit}
        className='card w-96 bg-base-100 p-6 shadow-xl'
      >
        <h1 className='text-xl font-bold mb-4'>Sign in with Email</h1>
        <input
          type='email'
          placeholder='mike@sripatro.com'
          className='input input-bordered border-2 focus:border-red-600 w-full mb-3 rounded-lg'
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button
          className='btn bg-red-600 text-base text-white w-full rounded-lg'
          type='submit'
        >
          {loading ? (
            <span className='loading loading-spinner'></span>
          ) : (
            'Send Mail'
          )}
        </button>
        <br />
        <span className='text-xs mx-.5'>
          by continuing you are accepting our Terms and Conditions & Privacy
          Policy
        </span>
      </form>
      <ThemeSwitcher />
    </div>
  );
}
