import CalendarMulti from "@/components/CalendarMulti";
import Header from "@/components/Header";
import Head from "next/head";

export default async function CalendarPage({ params, searchParams }) {
  // searchParams may contain year and month from the Patro onDateClick handler
  const { year, month } = (await searchParams) || {};

  const props = {};
  if (year) props.defaultYear = String(year);
  if (month) props.defaultMonth = Number(month);

  return (
    <>
      <Header />
      <div className="p-4 text-center max-w-4xl mx-auto">
        <CalendarMulti {...props} forceCurrentOnMount={true} />
        {/* FAQ Section */}
        <div className="mt-10 text-left">
          <h2 className="text-lg font-bold mb-4">Frequently Asked Questions</h2>
          <div className="join join-vertical w-full">
            <div className="collapse collapse-arrow join-item border border-base-300 bg-base-100">
              <input type="checkbox" />
              <div className="collapse-title text-base font-medium">
                Why are some dates shown in red?
              </div>
              <div className="collapse-content text-sm text-base-600">
                Saturdays and holiday dates are shown in red for quick
                visibility. Holidays are sourced from the festival data.
              </div>
            </div>

            <div className="collapse collapse-arrow join-item border border-base-300 bg-base-100">
              <input type="checkbox" />
              <div className="collapse-title text-base font-medium">
                How do I show or hide Tithi, Nakshatra, Rasi, or Festivals?
              </div>
              <div className="collapse-content text-sm text-base-600">
                Use the "Customize" button above the calendar or visit the
                Settings page to toggle these options. Preferences are saved in
                your browser.
              </div>
            </div>

            <div className="collapse collapse-arrow join-item border border-base-300 bg-base-100">
              <input type="checkbox" />
              <div className="collapse-title text-base font-medium">
                Can I show Nepali dates in Devanagari digits?
              </div>
              <div className="collapse-content text-sm text-base-600">
                Yes. Enable "Nepali digits" from the Customize menu or Calendar
                section in Settings to render dates like १, २, ३.
              </div>
            </div>

            <div className="collapse collapse-arrow join-item border border-base-300 bg-base-100">
              <input type="checkbox" />
              <div className="collapse-title text-base font-medium">
                How do festivals and holidays appear?
              </div>
              <div className="collapse-content text-sm text-base-600">
                Festival notes come from the data-db source and can be toggled
                on. Holidays are automatically highlighted in red.
              </div>
            </div>

            <div className="collapse collapse-arrow join-item border border-base-300 bg-base-100">
              <input type="checkbox" />
              <div className="collapse-title text-base font-medium">
                Will the calendar always show the current month?
              </div>
              <div className="collapse-content text-sm text-base-600">
                Yes. The calendar page detects the current Gregorian month on
                load and aligns to the corresponding Bikram Sambat month.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
