import { connectDB } from "@/lib/mongodb";
import BlogSubscriber from "@/models/BlogSubscriber";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ConfirmPage({ params }) {
  const { token, locale } = params;
  await connectDB();
  const sub = await BlogSubscriber.findOne({ verifyToken: token });
  if (!sub) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 text-center">
        Invalid or used link.
      </div>
    );
  }
  if (sub.verifyTokenExpires && sub.verifyTokenExpires.getTime() < Date.now()) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 text-center">
        Link expired. Please re-subscribe.
      </div>
    );
  }
  if (!sub.verified) {
    sub.verified = true;
    sub.verifyToken = undefined;
    sub.verifyTokenExpires = undefined;
    await sub.save();
  }
  redirect(`/${sub.locale}/blog?sub=confirmed`);
}
