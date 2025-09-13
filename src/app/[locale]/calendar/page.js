import CalendarMulti from "@/components/CalendarMulti";
import Header from "@/components/Header";
import Head from "next/head";

export default function CalendarPage({ params, searchParams }) {
  // searchParams may contain year and month from the Patro onDateClick handler
  const { year, month } = searchParams || {};

  const props = {};
  if (year) props.defaultYear = String(year);
  if (month) props.defaultMonth = Number(month);

  return (
    <>
      <Header />
      <div className="p-4">
        <CalendarMulti {...props} />
      </div>
    </>
  );
}
