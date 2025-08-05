import { useTranslations } from "next-intl";
import Footer from "@/components/Footer.js";
import Header from "@/components/Header.js";
import Patro from "@/components/Patro.js";
import Weather from "@/components/Weather.js";
import Link from "next/link";
import Tiles from "@/components/Tiles.js";
import Comments from "@/components/Comments/Comments";

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <div>
      <Header />
      <div className="w-full">
        <Tiles />
        <Patro />
        <Weather />
      </div>
      <Link href="/auth/signin">LOGIN</Link>
      <p>{t("title")}</p>
      Monster is Back
      <p>{t("content")}</p>
      <Comments currentUserId="1" />
      <Footer />
    </div>
  );
}
