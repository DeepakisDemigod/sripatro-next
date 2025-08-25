"use client";

import Comments from "@/components/Comments/Comments";
import Header from "@/components/Header";
import Shubhsaita from "@/components/Shubhsaita";
import Image from "next/image";

export default function page() {
  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="">
          <Image
            className="rounded-lg mx-auto mb-4"
            src="/shubh-saita.png.webp"
            alt="shubh-saita"
            width={400}
            height={200}
          />
          <h1 className="text-2xl font-bold">चौघडिया नाम किन?</h1>
          <p className="mt-4 text-sm">
            हिन्दु धर्म अनुसार, सूर्योदयदेखि सूर्यास्तसम्मको समयलाई ३० घटीमा
            बाँडिन्छ। चौघडिया मुहूर्तका लागि, यो समयलाई ८ भागमा बाँडिन्छ, जसले
            गर्दा दिन र रात दुबैमा ८ वटा चौघडिया मुहूर्त हुन्छन्। प्रत्येक
            चौघडिया मुहूर्त करिब ४ घटीको हुन्छ, त्यसैले यसलाई चौघडिया भनिन्छ।
            चौघडिया = "चो" (चार) + "घडिया" (घटी)। चौघडिया मुहूर्तलाई चतुर्ष्टिका
            मुहूर्त पनि भनिन्छ।
          </p>
        </div>

        <Shubhsaita />

        <div className="collapse collapse-arrow border border-base-300 rounded  bg-base-100">
          <input type="checkbox" />
          <div className="collapse-title text-md font-medium">
            शुभ चौघडिया राहुकालसँग मिल्यो भने के गर्ने?
          </div>
          <div className="collapse-content">
            <p className="text-sm">
              कहिलेकाहीं शुभ चौघडिया राहुकालसँग मिल्न सक्छ। राहुकाललाई अत्यन्त
              अशुभ मानिन्छ, विशेषगरी दक्षिण भारतमा यसलाई धेरै महत्व दिइन्छ।
              यद्यपि धेरै प्रामाणिक ग्रन्थहरूमा राहुकालको उल्लेख छैन, तर
              राहुकालसँग मिल्ने चौघडिया मुहूर्त त्याग्न सधैं उत्तम मानिन्छ।
            </p>
          </div>
        </div>

        <div className="collapse collapse-arrow border border-base-300 rounded bg-base-100">
          <input type="checkbox" />
          <div className="collapse-title text-md font-medium">
            शुभ चौघडिया वारा, काल र रात्री वेळासँग मिल्यो भने के गर्ने?
          </div>
          <div className="collapse-content">
            <p className="text-sm">
              शुभ चौघडिया वारा वेळा, काल वेळा वा काल रात्रीसँग पनि मिल्न सक्छ।
              यस्तो अवस्थामा ती समयलाई अशुभ मानिन्छ र तिनलाई त्याग गर्नुपर्छ।
              भनिन्छ, वारा, काल र रात्री वेळामा गरिएका मांगलिक कार्यहरू सफल
              हुँदैनन्।
            </p>
          </div>
        </div>

        <div className="collapse collapse-arrow border border-base-300 rounded bg-base-100">
          <input type="checkbox" />
          <div className="collapse-title text-md font-medium">
            चौघडिया शुभ कि अशुभ कसरी चिन्ने?
          </div>
          <div className="collapse-content space-y-3">
            <p className="text-sm">
              प्रत्येक बारको पहिलो मुहूर्त उसै बारको स्वामी ग्रहद्वारा शासित
              हुन्छ। उदाहरण: आइतबारको पहिलो चौघडिया सूर्यको प्रभावमा हुन्छ।
              त्यसपछि क्रमश: शुक्र, बुध, चन्द्र, शनि, बृहस्पति र मंगल। अन्तिम
              चौघडिया पनि बारको स्वामीद्वारा शासित हुन्छ।
            </p>
            <p>
              शुभ चौघडिया – शुक्र, बुध, चन्द्र र बृहस्पतिको प्रभावमा हुने
              चौघडिया शुभ मानिन्छ। अशुभ – सूर्य, मंगल र शनिको प्रभावमा हुने
              चौघडिया अशुभ मानिन्छ। यद्यपि, केही विशेष कार्यको लागि अशुभ चौघडिया
              पनि उपयुक्त हुन सक्छ।
            </p>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="card bg-base-200 shadow">
                <div className="card-body">
                  <h2 className="card-title text-md">उद्वेग चौघडिया (सूर्य)</h2>
                  <p className="text-sm">
                    सूर्य अशुभ ग्रह हो। यसकारण यसको समयलाई उद्वेग भनेर चिनिन्छ।
                    तर सरकारी कामकाजका लागि यो शुभ मानिन्छ।
                  </p>
                </div>
              </div>

              <div className="card bg-base-200 shadow">
                <div className="card-body">
                  <h2 className="card-title text-md">चर चौघडिया (शुक्र)</h2>
                  <p className="text-sm">
                    शुक्र शुभ ग्रह हो। यसको समयलाई चर भनिन्छ। विशेषगरी यात्रा
                    सम्बन्धी कार्यका लागि उपयुक्त मानिन्छ।
                  </p>
                </div>
              </div>

              <div className="card bg-base-200 shadow">
                <div className="card-body">
                  <h2 className="card-title text-md">लाभ चौघडिया (बुध)</h2>
                  <p className="text-sm">
                    बुध पनि शुभ ग्रह हो। यसको समयलाई लाभ भनिन्छ। नयाँ ज्ञान,
                    पढाइ वा सीप सिक्नको लागि उत्तम।
                  </p>
                </div>
              </div>

              <div className="card bg-base-200 shadow">
                <div className="card-body">
                  <h2 className="card-title text-md">अमृत चौघडिया (चन्द्र)</h2>
                  <p className="tex-sm">
                    चन्द्रलाई पनि शुभ ग्रह मानिन्छ। यसको समय अमृत चौघडिया भनेर
                    चिनिन्छ, जुन सबै प्रकारका कामहरूका लागि उपयुक्त हुन्छ।
                  </p>
                </div>
              </div>

              <div className="card bg-base-200 shadow">
                <div className="card-body">
                  <h2 className="card-title text-md">काल चौघडिया (शनि)</h2>
                  <p className="text-sm">
                    शनि अशुभ ग्रह हो। यसको समयलाई काल भनिन्छ। शुभ कार्य गर्न
                    उपयुक्त छैन तर धन संचय गर्नको लागि उपयुक्त मानिन्छ।
                  </p>
                </div>
              </div>

              <div className="card bg-base-200 shadow">
                <div className="card-body">
                  <h2 className="card-title">शुभ चौघडिया (बृहस्पति)</h2>
                  <p>
                    बृहस्पति शुभ ग्रह हो। यसको समय शुभ चौघडिया हो। विवाह र अन्य
                    मांगलिक कार्यहरूका लागि उत्तम।
                  </p>
                </div>
              </div>

              <div className="card bg-base-200 shadow">
                <div className="card-body">
                  <h2 className="card-title">रोग चौघडिया (मंगल)</h2>
                  <p>
                    मंगल अशुभ ग्रह हो। यसको समय रोग चौघडिया हो। शुभ कार्य नगर्नु
                    तर युद्ध, प्रतिस्पर्धा वा शत्रु पराजित गर्न प्रयोग गर्न
                    सकिने।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Comments currentUserId={1} />
      </div>
    </div>
  );
}
