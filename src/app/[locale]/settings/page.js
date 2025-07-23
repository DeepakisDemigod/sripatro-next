import LocaleSwitcher from "@/components/LocaleSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function page() {
  return (
    <div>
      <ThemeSwitcher />
      <LocaleSwitcher />
    </div>
  );
}
