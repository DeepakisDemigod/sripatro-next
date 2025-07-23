"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function LocaleSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const localeActive = useLocale();

  const onSelectChange = (e) => {
    const nextLocale = e.target.value;
    if (nextLocale === localeActive) return;

    startTransition(() => {
      router.replace(`/${nextLocale}`);
    });
  };

  return (
    <label className=" rounded px-2 py-1">
      <span className="sr-only">Change Language</span>
      <select
        className="bg-transparent py-2 focus:outline-none"
        onChange={onSelectChange}
        value={localeActive}
        disabled={isPending}
      >
        <option value="en">English</option>
        <option value="ne">Nepali</option>
      </select>
    </label>
  );
}
