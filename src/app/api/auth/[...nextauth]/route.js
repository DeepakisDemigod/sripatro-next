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
          html: `<div style="max-width: 400px; padding: 24px; border: 1px solid #eee; border-radius: 8px; font-family: sans-serif;">
    <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 16px;">Sign in to Sripatro.com</h1>
    <a href="${url}" style="display: block; font-weight: bold; text-align: center; background-color: #dc2626; color: white; padding: 12px 16px; border-radius: 6px; text-decoration: none; font-size: 16px;">
      Sign In
    </a>
    <p style="font-size: 12px; color: #555; margin-top: 12px;">This link expires in 10 minutes.</p>
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

