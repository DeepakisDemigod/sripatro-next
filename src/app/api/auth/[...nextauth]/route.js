/*
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    EmailProvider({
      async sendVerificationRequest({ identifier, url }) {
        const { data, error } = await resend.emails.send({
          from: "Sripatro <auth@sripatro.com>",
          to: [identifier],
          subject: "Signin to sripatro.com",
          html: `
	  <head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Gabarito:wght@400..900&family=TikTok+Sans:opsz,wght@12..36,300..900&display=swap" rel="stylesheet">
</head>

<div style="
  max-width: 480px;
  margin: 2rem auto;
  border-radius: 0.75rem;
  background-color: #ffffff;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  font-family: 'Gabarito', sans-serif;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  color: #1f2937;
  line-height: 1.6;
">

  <!-- Logo -->
  <div style="text-align: left; margin-bottom: 1rem;">
    <img
      src="https://gzujq4nvwe.ufs.sh/f/Fc4vXyfucodUwfBzApzTclukJTWn2d9VoU7Oe6XQtq5fCwNv"
      alt="logo"
      style="height: 48px; border-radius: 0.5rem;"
    />
  </div>

  <!-- Title -->
  <h1 style="
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    text-align: left;
  ">
    Sign in to sripatro.com
  </h1>

  <p style="font-size: 0.9rem; color: #374151; margin-bottom: 1rem;">
    Your Magic Link is ready 💫
  </p>

  <p style="font-size: 0.85rem; color: #4b5563; margin-bottom: 1.5rem;">
    Click the button below to sign in. Don’t share this link with anyone.
  </p>

  <!-- Sign In Button -->
  <div style="margin: 1.5rem 0;">
    <a href="${url}" target="_blank" style="
      display: inline-block;
      background-color: #dc2626;
      color: #ffffff;
      padding: 0.75rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      border-radius: 0.375rem;
      transition: background-color 0.2s ease;
    ">
      Click here to Sign In
    </a>
  </div>

  <!-- Fallback URL -->
  <p style="font-size: 0.8rem; color: #6b7280; margin-bottom: 0.25rem;">
    Or copy and paste this URL into your browser:
  </p>
  <p style="
    word-break: break-all;
    background-color: #f9fafb;
    padding: 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    border: 1px solid #e5e7eb;
    color: #111827;
  ">
    ${url}
  </p>

  <!-- Footer -->
  <p style="font-size: 0.75rem; color: #9ca3af; margin-top: 1.5rem;">
    If you didn’t request this, feel free to ignore or delete this email.
  </p>

  <p style="font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem;">
    This link will expire in 10 minutes.
  </p>

  <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #e5e7eb;" />

  <p style="font-size: 0.75rem; color: #9ca3af; text-align: center;">
    © 2025 SriPatro
  </p>
</div>

`

        });

        if (error) {
          console.error("Resend error:", error);
          throw new Error("Failed to send verification email.");
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // Exclude Pages to Check
  pages: {
	  signIn: "/auth/signin",
    verifyRequest: '/auth/verify-request',
	  error: "/auth/error"

  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

*/

// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { Resend } from "resend";

import { connectDB } from "@/lib/mongodb"; // <-- your mongoose helper
import User from "@/models/User"; // <-- your app User model

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    EmailProvider({
      async sendVerificationRequest({ identifier, url }) {
        const { data, error } = await resend.emails.send({
          from: "Sripatro <auth@sripatro.com>",
          to: [identifier],
          subject: "Signin to sripatro.com",
          html: `
  <head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Gabarito:wght@400..900&family=TikTok+Sans:opsz,wght@12..36,300..900&display=swap" rel="stylesheet">
  </head>

  <div style="
    max-width: 480px;
    margin: 2rem auto;
    border-radius: 0.75rem;
    background-color: #ffffff;
    padding: 2rem;
    border: 1px solid #e5e7eb;
    font-family: 'Gabarito', sans-serif;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    color: #1f2937;
    line-height: 1.6;
  ">

    <!-- Logo -->
    <div style="text-align: left; margin-bottom: 1rem;">
      <img
        src="https://gzujq4nvwe.ufs.sh/f/Fc4vXyfucodUwfBzApzTclukJTWn2d9VoU7Oe6XQtq5fCwNv"
        alt="logo"
        style="height: 48px; border-radius: 0.5rem;"
      />
    </div>

    <!-- Title -->
    <h1 style="
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      text-align: left;
    ">
      Sign in to sripatro.com
    </h1>

    <p style="font-size: 0.9rem; color: #374151; margin-bottom: 1rem;">
      Your Magic Link is ready 💫
    </p>

    <p style="font-size: 0.85rem; color: #4b5563; margin-bottom: 1.5rem;">
      Click the button below to sign in. Don’t share this link with anyone.
    </p>

    <!-- Sign In Button -->
    <div style="margin: 1.5rem 0;">
      <a href="${url}" target="_blank" style="
        display: inline-block;
        background-color: #dc2626;
        color: #ffffff;
        padding: 0.75rem 1.25rem;
        font-size: 0.875rem;
        font-weight: 500;
        text-decoration: none;
        border-radius: 0.375rem;
        transition: background-color 0.2s ease;
      ">
        Click here to Sign In
      </a>
    </div>

    <!-- Fallback URL -->
    <p style="font-size: 0.8rem; color: #6b7280; margin-bottom: 0.25rem;">
      Or copy and paste this URL into your browser:
    </p>
    <p style="
      word-break: break-all;
      background-color: #f9fafb;
      padding: 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      border: 1px solid #e5e7eb;
      color: #111827;
    ">
      ${url}
    </p>

    <!-- Footer -->
    <p style="font-size: 0.75rem; color: #9ca3af; margin-top: 1.5rem;">
      If you didn’t request this, feel free to ignore or delete this email.
    </p>

    <p style="font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem;">
      This link will expire in 10 minutes.
    </p>

    <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #e5e7eb;" />

    <p style="font-size: 0.75rem; color: #9ca3af; text-align: center;">
      © 2025 SriPatro
    </p>
  </div>
  `,
        });

        if (error) {
          console.error("Resend error:", error);
          throw new Error("Failed to send verification email.");
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  // keep your custom pages
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },

  // Attach user info from our app User collection to the session
  callbacks: {
    async session({ session }) {
      try {
        await connectDB();
        const u = await User.findOne({ email: session.user.email }).lean();
        if (u) {
          session.user.id = u._id.toString();
          session.user.role = u.role || "user";
          session.user.profileComplete = !!u.profileComplete;
        } else {
          session.user.profileComplete = false;
        }
      } catch (err) {
        console.error("session callback error:", err);
        session.user.profileComplete = false;
      }
      return session;
    },
  },

  // Ensure a record exists in our User collection after successful sign-in
  events: {
    async signIn({ user }) {
      try {
        await connectDB();
        // create a minimal app-level user row if it doesn't exist, and set isOnline true
        await User.findOneAndUpdate(
          { email: user.email },
          {
            $setOnInsert: { email: user.email, profileComplete: false },
            $set: { isOnline: true },
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error("signIn event upsert error:", err);
      }
    },
    async signOut({ token }) {
      try {
        await connectDB();
        const email = token?.email;
        if (email) {
          await User.findOneAndUpdate({ email }, { $set: { isOnline: false } });
        }
      } catch (err) {
        console.error("signOut event update error:", err);
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
