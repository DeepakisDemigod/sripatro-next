import "./[locale]/globals.css";

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
      <body>{children}</body>
    </html>
  );
}
