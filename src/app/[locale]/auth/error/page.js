"use client"



import { useSearchParams } from "next/navigation"

import Link from "next/link"



export default function AuthErrorPage() {

 const searchParams = useSearchParams()

 const error = searchParams.get("error")



 let title = "Authentication Error"

 let message = "Something went wrong. Please try again."



 switch (error) {

  case "Verification":

   title = "Link Expired or Invalid"

   message =

    "This sign-in link is no longer valid. Please request a new one."

   break

  case "AccessDenied":

   title = "Access Denied"

   message =

    "You do not have permission to sign in. Please contact support if you believe this is a mistake."

   break

  case "Configuration":

   title = "Configuration Error"

   message =

    "There was a problem with the server configuration. Please try again later."

   break

  case "Default":

   title = "Authentication Error"

   message = "An unexpected error occurred. Please try again."

   break

 }



 return (

  <div className="min-h-screen flex items-center justify-center bg-base-200">

   <div className="card w-full max-w-md shadow-xl bg-base-100">

    <div className="card-body text-center">

     <h1 className="text-xl font-bold mb-2">{title}</h1>

     <p className="text-gray-600 text-sm">{message}</p>

     <div className="card-actions justify-center">

      <Link href="/auth/signin" className="btn bg-red-600 text-white rounded-lg">

       Back to Sign In

      </Link>

     </div>

  <p className="text-xs text-base-700/90 border-t border-base-300 pt-2">
          Don’t forget to check your spam folder just in case.
          <br />
          Need help?{" "}
          <Link
            href="mailto:deepakthapa1423@gmail.com"
            target="_blank"
            className="underline text-blue-600"
          >
            Email me
          </Link>
        </p>

    </div>

   </div>

  </div>

 )

}
