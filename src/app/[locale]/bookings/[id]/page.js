import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";
import BookingActions from "@/components/BookingActions";
import Header from "@/components/Header";
import BookingClient from "@/components/BookingClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Tag } from "phosphor-react";
import Link from "next/link";

export default async function Page({ params }) {
  await connectDB();
  const booking = await Booking.findById(params.id).lean();
  if (!booking)
    return (
      <div className="p-8 text-center text-red-600 text-xl">
        Booking not found
      </div>
    );
  const astrologer = await User.findById(booking.astrologerId).lean();
  const session = await getServerSession(authOptions);
  const isAstrologer = session?.user?.email === booking.astrologerEmail;
  return (
    <>
      <Header />
      <div className="py-8 min-h-screen bg-base-200 flex flex-col items-center">
        <div className="bg-base-100 shadow-md border border-base-200 rounded-2xl w-full max-w-2xl mb-8 px-6 py-5 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-red-600 tracking-tight">
              Booking Details
            </h1>
            {/* Status icon+filled */}
            <span className="flex items-center gap-2">
              {booking.status === "pending" && (
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-yellow-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="white"
                    viewBox="0 0 256 256"
                  >
                    <path d="M128,24A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm4-88V80a8,8,0,0,0-16,0v56a8,8,0,0,0,4.69,7.25l40,20a8,8,0,1,0,7.16-14.5Z"></path>
                  </svg>
                </span>
              )}
              {booking.status === "approved" && (
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="white"
                    viewBox="0 0 256 256"
                  >
                    <path d="M128,24A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm40.49-99.51-48,48a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L120,148.69l42.34-42.35a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </span>
              )}
              {booking.status === "rejected" && (
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="white"
                    viewBox="0 0 256 256"
                  >
                    <path d="M128,24A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm28.28-99.31-28.29,28.3-28.29-28.3a8,8,0,0,1,11.32-11.32L128,132.69l22.29-22.32a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </span>
              )}
              {booking.status === "completed" && (
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="white"
                    viewBox="0 0 256 256"
                  >
                    <path d="M225.86,102.82c-3.77-3.94-7.67-8-9.14-11.57-1.36-3.27-1.44-8.69-1.52-13.94-.15-9.76-.31-20.82-8-28.51s-18.75-7.85-28.51-8c-5.25-.08-10.67-.16-13.94-1.52-3.56-1.47-7.63-5.37-11.57-9.14C146.28,23.51,138.44,16,128,16s-18.27,7.51-25.18,14.14c-3.94,3.77-8,7.67-11.57,9.14C88,40.64,82.56,40.72,77.31,40.8c-9.76.15-20.82.31-28.51,8S41,67.55,40.8,77.31c-.08,5.25-.16,10.67-1.52,13.94-1.47,3.56-5.37,7.63-9.14,11.57C23.51,109.72,16,117.56,16,128s7.51,18.27,14.14,25.18c3.77,3.94,7.67,8,9.14,11.57,1.36,3.27,1.44,8.69,1.52,13.94.15,9.76.31,20.82,8,28.51s18.75,7.85,28.51,8c5.25.08,10.67.16,13.94,1.52,3.56,1.47,7.63,5.37,11.57,9.14C109.72,232.49,117.56,240,128,240s18.27-7.51,25.18-14.14c3.94-3.77,8-7.67,11.57-9.14,3.27-1.36,8.69-1.44,13.94-1.52,9.76-.15,20.82-.31,28.51-8s7.85-18.75,8-28.51c.08-5.25.16-10.67,1.52-13.94,1.47-3.56,5.37-7.63,9.14-11.57C232.49,146.28,240,138.44,240,128S232.49,109.73,225.86,102.82Zm-11.55,39.29c-4.79,5-9.75,10.17-12.38,16.52-2.52,6.1-2.63,13.07-2.73,19.82-.1,7-.21,14.33-3.32,17.43s-10.39,3.22-17.43,3.32c-6.75.1-13.72.21-19.82,2.73-6.35,2.63-11.52,7.59-16.52,12.38S132,224,128,224s-9.15-4.92-14.11-9.69-10.17-9.75-16.52-12.38c-6.1-2.52-13.07-2.63-19.82-2.73-7-.1-14.33-.21-17.43-3.32s-3.22-10.39-3.32-17.43c-.1-6.75-.21-13.72-2.73-19.82-2.63-6.35-7.59-11.52-12.38-16.52S32,132,32,128s4.92-9.15,9.69-14.11,9.75-10.17,12.38-16.52c2.52-6.1,2.63-13.07,2.73-19.82.1-7,.21-14.33,3.32-17.43S70.51,56.9,77.55,56.8c6.75-.1,13.72-.21,19.82-2.73,6.35-2.63,11.52-7.59,16.52-12.38S124,32,128,32s9.15,4.92,14.11,9.69,10.17,9.75,16.52,12.38c6.1,2.52,13.07,2.63,19.82,2.73,7,.1,14.33.21,17.43,3.32s3.22,10.39,3.32,17.43c.1,6.75.21,13.72,2.73,19.82,2.63,6.35,7.59,11.52,12.38,16.52S224,124,224,128,219.08,137.15,214.31,142.11ZM173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34Z"></path>
                  </svg>
                </span>
              )}
              <span className="text-xs text-base-content/70 capitalize ml-1">
                {booking.status}
              </span>
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:gap-8 gap-4">
            <div className="flex-1">
              <div className="mb-1 text-base-content/80">
                {/* <span className="font-semibold">Service:</span>{" "} */}
                <span className="text-xl font-bold">
                  {" "}
                  {booking.service.title} By{" "}
                  {astrologer?.name || booking.astrologerEmail}
                </span>
                <div className="px-6 inline flex items-center justify-between font-medium rounded-lg bg-green-600 p-1 text-md text-white">
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="#ffffff"
                      viewBox="0 0 256 256"
                    >
                      <path d="M243.31,136,144,36.69A15.86,15.86,0,0,0,132.69,32H40a8,8,0,0,0-8,8v92.69A15.86,15.86,0,0,0,36.69,144L136,243.31a16,16,0,0,0,22.63,0l84.68-84.68a16,16,0,0,0,0-22.63Zm-96,96L48,132.69V48h84.69L232,147.31ZM96,84A12,12,0,1,1,84,72,12,12,0,0,1,96,84Z"></path>
                    </svg>
                    <span>Price</span>
                  </div>
                  <span className="">₹{booking.service.price}</span>
                </div>
              </div>
              <div className="mb-1 text-base-content/80">
                <span className="font-semibold text-xl"></span>{" "}
                {booking.userEmail}
              </div>
              {/* <div className="mb-1 text-base-content/80">
                <span className="font-semibold">Astrologer:</span>{" "}
                {astrologer?.name || booking.astrologerEmail}
              </div> */}

              <div className="mb-1 text-base-content/80">
                {booking.message === "" ? booking.message : ""}
              </div>
              <div className="text-xs text-right text-gray-500 mb-1">
                Booked at: {new Date(booking.createdAt).toLocaleString()}
              </div>
            </div>
            {isAstrologer && (
              <div className="flex items-center md:items-start justify-end md:justify-end">
                <BookingActions
                  bookingId={booking._id.toString()}
                  status={booking.status}
                />
              </div>
            )}
            {/* Rejected notice */}
            {booking.status === "rejected" && (
              <div className="bg-red-600/10 rounded-lg p-4 border border-red-600">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="#7F1D1D"
                    viewBox="0 0 256 256"
                  >
                    <path d="M53.92,34.62A8,8,0,0,0,48,32,16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a8,8,0,0,0,5.92-13.38ZM73.55,80H48V51.88ZM48,208V96H88.1L189.92,208ZM224,48V177.23a8,8,0,1,1-16,0V96H134.88a8,8,0,0,1,0-16H208V48H184v8a8,8,0,0,1-16,0V48H91.25a8,8,0,0,1,0-16H168V24a8,8,0,0,1,16,0v8h24A16,16,0,0,1,224,48Z"></path>
                  </svg>
                  <div>
                    <h1 className="font-bold text-red-900 text-xl">
                      Booking Rejected
                    </h1>
                    <span className="text-sm text-base-content/80">
                      Please try again later, or try other{" "}
                      <Link
                        className="underline text-blue-400"
                        href="/astrologers"
                      >
                        Astrologers
                      </Link>
                      .
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Pending notice */}
            {booking.status === "pending" && (
              <div className="bg-yellow-600/20 rounded-lg p-4 border border-yellow-600">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="#713F12"
                    viewBox="0 0 256 256"
                  >
                    <path d="M128,24A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm4-88V80a8,8,0,0,0-16,0v56a8,8,0,0,0,4.69,7.25l40,20a8,8,0,1,0,7.16-14.5Z"></path>
                  </svg>
                  <div>
                    <h1 className="font-bold text-yellow-600 text-xl">
                      Booking Pending
                    </h1>
                    <span className="text-sm text-base-content/80">
                      Please wait while the astrologer reviews your request.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Approved notice */}
            {booking.status === "approved" && (
              <div className="bg-blue-600/10 rounded-lg p-4 border border-blue-600">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="#1E3A8A"
                    viewBox="0 0 256 256"
                  >
                    <path d="M128,24A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm40.49-99.51-48,48a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L120,148.69l42.34-42.35a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                  <div>
                    <h1 className="font-bold text-blue-500 text-xl">
                      Booking Approved
                    </h1>
                    <span className="text-sm text-base-content/80">
                      You can proceed. When finished, the astrologer will mark
                      it completed.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Completed notice */}
            {booking.status === "completed" && (
              <div className="bg-green-600/10 rounded-lg p-4 border border-green-600">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="#15803D"
                    viewBox="0 0 256 256"
                  >
                    <path d="M225.86,102.82c-3.77-3.94-7.67-8-9.14-11.57-1.36-3.27-1.44-8.69-1.52-13.94-.15-9.76-.31-20.82-8-28.51s-18.75-7.85-28.51-8c-5.25-.08-10.67-.16-13.94-1.52-3.56-1.47-7.63-5.37-11.57-9.14C146.28,23.51,138.44,16,128,16s-18.27,7.51-25.18,14.14c-3.94,3.77-8,7.67-11.57,9.14C88,40.64,82.56,40.72,77.31,40.8c-9.76.15-20.82.31-28.51,8S41,67.55,40.8,77.31c-.08,5.25-.16,10.67-1.52,13.94-1.47,3.56-5.37,7.63-9.14,11.57C23.51,109.72,16,117.56,16,128s7.51,18.27,14.14,25.18c3.77,3.94,7.67,8,9.14,11.57,1.36,3.27,1.44,8.69,1.52,13.94.15,9.76.31,20.82,8,28.51s18.75,7.85,28.51,8c5.25.08,10.67.16,13.94,1.52,3.56,1.47,7.63,5.37,11.57,9.14C109.72,232.49,117.56,240,128,240s18.27-7.51,25.18-14.14c3.94-3.77,8-7.67,11.57-9.14,3.27-1.36,8.69-1.44,13.94-1.52,9.76-.15,20.82-.31,28.51-8s7.85-18.75,8-28.51c.08-5.25.16-10.67,1.52-13.94,1.47-3.56,5.37-7.63,9.14-11.57C232.49,146.28,240,138.44,240,128S232.49,109.73,225.86,102.82Zm-11.55,39.29c-4.79,5-9.75,10.17-12.38,16.52-2.52,6.1-2.63,13.07-2.73,19.82-.1,7-.21,14.33-3.32,17.43s-10.39,3.22-17.43,3.32c-6.75.1-13.72.21-19.82,2.73-6.35,2.63-11.52,7.59-16.52,12.38S132,224,128,224s-9.15-4.92-14.11-9.69-10.17-9.75-16.52-12.38c-6.1-2.52-13.07-2.63-19.82-2.73-7-.1-14.33-.21-17.43-3.32s-3.22-10.39-3.32-17.43c-.1-6.75-.21-13.72-2.73-19.82-2.63-6.35-7.59-11.52-12.38-16.52S32,132,32,128s4.92-9.15,9.69-14.11,9.75-10.17,12.38-16.52c2.52-6.1,2.63-13.07,2.73-19.82.1-7,.21-14.33,3.32-17.43S70.51,56.9,77.55,56.8c6.75-.1,13.72-.21,19.82-2.73,6.35-2.63,11.52-7.59,16.52-12.38S124,32,128,32s9.15,4.92,14.11,9.69,10.17,9.75,16.52,12.38c6.1,2.52,13.07,2.63,19.82,2.73,7,.1,14.33.21,17.43,3.32s3.22,10.39,3.32,17.43c.1,6.75.21,13.72,2.73,19.82,2.63,6.35,7.59,11.52,12.38,16.52S224,124,224,128,219.08,137.15,214.31,142.11ZM173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34Z"></path>
                  </svg>
                  <div>
                    <h1 className="font-bold text-green-700 text-xl">
                      Booking Completed
                    </h1>
                    <span className="text-sm text-base-content/80">
                      Thank you for using SriPatro. You may close this page.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Chat and video call removed */}
        </div>
      </div>
    </>
  );
}
