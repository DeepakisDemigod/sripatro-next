/*import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    EmailProvider({
      server: {
        host: "smtp-relay.brevo.com",
        port: 587, //456
        auth: {
          user: process.env.BREVO_USER,
          pass: process.env.BREVO_PASS,
        },
      },
      from: "deepakthapa1423@gmail.com",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
*/

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
          from: "auth@sripatro.com", // MUST be verified in Resend
          to: [identifier],
          subject: "Login to sripatro.com",
          html: `
            <p>Click the link below to login:</p>
            <a href="${url}">${url}</a>
            <p>This link expires in 10 minutes.</p>
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
};
*/

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
          from: "auth@sripatro.com", // must be verified in Resend
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
      src="https://i.ibb.co/0y4DpgGb/Screenshot-2025-07-24-15-57-29-04-40deb401b9ffe8e1df2f1cc5ba480b12.jpg"
      alt="SriPatro Logo"
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
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

