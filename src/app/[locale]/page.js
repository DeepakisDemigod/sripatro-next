import { useTranslations } from "next-intl";
import LocaleSwitcher from "../../components/LocaleSwitcher.js";
import Footer from "@/components/Footer.js";
import Header from "@/components/Header.js";
import Patro from "@/components/Patro.js";
import Link from "next/link";
import Tiles from "@/components/Tiles.js";

export default function Home() {
  const t = useTranslations("HomePage");
  return (
    <div>
      <Header />
    <Tiles /> 
      <LocaleSwitcher />
      <Patro />
      <Link href="/auth/signin">LOGIN</Link>
      <p>{t("title")}</p>
      Monster is Back
      <p>{t("content")}</p>
      <Footer />
    </div>
  );
}
