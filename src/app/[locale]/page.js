import { useTranslations } from "next-intl";
import Footer from "@/components/Footer.js";
import Header from "@/components/Header.js";
import Patro from "@/components/Patro.js";
import Saita from "@/components/Saita.js";
import Weather from "@/components/Weather.js";
import Link from "next/link";
import Tiles from "@/components/Tiles.js";

export default function Home() {
  const t = useTranslations("HomePage");
  return (
    <div>
      <Header />
      <Tiles />
	  <div className="w-full">

<Patro />
	  <Saita />
	  <Weather />

	  </div>
      	  {/* <Link href="/auth/signin">LOGIN</Link>
      <p>{t("title")}</p>
      Monster is Back
      <p>{t("content")}</p>*/}
      <Footer />
    </div>
  );
}
