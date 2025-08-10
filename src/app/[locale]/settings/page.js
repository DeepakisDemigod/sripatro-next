import LocaleSwitcher from "@/components/LocaleSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";
//import { CaretLeft } from "phosphor-react"

export default function page() {
  return (
    <div className="max-w-3xl p-4">
	  <h3 className="text-xl font-bold">
	  {/* <CaretLeft size={19} />*/}
	  <span>Settings</span></h3>
	  <div className="flex items-center justify-between p-4 ">
            <p>Appearance <br /><span className="text-xs text-base-800">select your preferred theme</span>
</p>
            <ThemeSwitcher />
	  </div>

	  	  <div className="flex items-center justify-between p-4">
	  <p>Language<br /><span className="text-xs  text-base-800">select your preferred language</span>
</p>
           <LocaleSwitcher />
	  </div>

	      </div>
  );
}
