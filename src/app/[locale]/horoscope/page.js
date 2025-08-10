import HoroscopePredictions from "@/components/Horoscope/HoroscopePredictions.js"
import Header from "@/components/Header"
import Comments from "@/components/Comments/Comments"

export default function page() {
  return (
    <div><Header />
	  <HoroscopePredictions/><Comments currentUserId={1} /></div>
  )
}
