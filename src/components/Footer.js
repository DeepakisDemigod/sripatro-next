import Tools from "./Tools";

const Footer = () => {
  return (
    <div className="text-center bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-red-900 via-red-700 to-red-800  text-white">
      <div className="flex-1">
        <div className="flex items-center gap-2 text-lg font-bold p-4">
          {/*  <img
            src="/Shri-symbol.svg"
            alt="Sri Patro"
            className="w-12 bg-white rounded-full p-2"
          /> */}
          Sri Patro
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
