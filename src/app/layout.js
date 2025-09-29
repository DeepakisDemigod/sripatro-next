import "./[locale]/globals.css";
import { Gabarito } from "next/font/google";

export const metadata = {
  title: "SriPatro",
  applicationName: "SriPatro",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport = {
  themeColor: "#b91c1c",
};

const gabarito = Gabarito({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-gabarito",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="SriPatro Blog RSS"
          href="/rss.xml"
        />
      </head>
      <body className={`${gabarito.variable} antialiased`}>{children}</body>
    </html>
  );
}
