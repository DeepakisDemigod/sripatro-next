import Image from "next/image";
import Tools from "./Tools";

const Footer = () => {
  return (
    <div className="text-center bg-base-100 text-base-900">
      <div className="flex-1">
        <div className="flex items-center gap-2 text-lg font-bold p-4">
          <Image
            src="/logo-with-name.png"
            alt="logo"
            className="bg-white rounded-lg p-2 "
            width={150}
            height={20}
          />
        </div>
      </div>
      <Tools />

      <p className="flex p-4">
        Made with ❤️ by
        <a className="underline" href="https://github.com/DeepakisDemigod">
          @deepakisdemigod
        </a>
        for the nation
      </p>
      <span>Copyright © 2025 SriPatro</span>
    </div>
  );
};

export default Footer;
