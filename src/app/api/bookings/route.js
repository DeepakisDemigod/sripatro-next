import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route"; // relative path to your auth route
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await connectDB();

  const booking = await Booking.create({
    userEmail: session.user.email,
    astrologerId: body.astrologerId,
    astrologerEmail: body.astrologerEmail,
    service: body.service,
    message: body.message || "",
    status: "pending",
  });

  // Send email notification to astrologer
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Sripatro <notify@sripatro.com>",
    to: [body.astrologerEmail],
    subject: `New Booking for ${body.service.title}`,
    html: `
      <div style='font-family:sans-serif;padding:2rem;'>
        <h2 style='color:#dc2626;'>You have a new booking!</h2>
        <p><b>Service:</b> ${body.service.title} - ₹${body.service.price}</p>
        <p><b>Booked by:</b> ${session.user.email}</p>
        <p><b>Message:</b> ${body.message || "-"}</p>
        <p style='margin-top:2rem;'>Login to your dashboard to manage this booking.</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true, booking });
}

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const astrologerEmail = searchParams.get("astrologerEmail");
  let query = {};
  if (astrologerEmail) {
    query.astrologerEmail = astrologerEmail;
  }
  const bookings = await Booking.find(query).lean();
  return Response.json({ bookings });
}

export async function PUT(req) {
  await connectDB();
  const body = await req.json();
  const { id, status } = body;
  if (!id || !status) {
    return Response.json({ error: "Missing id or status" }, { status: 400 });
  }
  const booking = await Booking.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  if (!booking) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }

  // If completed, delete chat messages for this booking
  if (status === "completed") {
    const Chat = (await import("@/models/Chat")).default;
    await Chat.deleteMany({ bookingId: id });
    // Count unique customers for astrologer
    const completedBookings = await Booking.find({
      astrologerId: booking.astrologerId,
      status: "completed",
    });
    const uniqueCustomers = new Set(completedBookings.map((b) => b.userEmail));
    const User = (await import("@/models/User")).default;
    await User.findByIdAndUpdate(booking.astrologerId, {
      customersCount: uniqueCustomers.size,
    });
  }

  // Send email notification to user on status change
  const resend = new Resend(process.env.RESEND_API_KEY);
  if (status === "approved") {
    await resend.emails.send({
      from: "Sripatro <notify@sripatro.com>",
      to: [booking.userEmail],
      subject: `Your booking for ${booking.service.title} is approved!`,
      html: `
        <div style='font-family:sans-serif;padding:2rem;'>
          <h2 style='color:#dc2626;'>Booking Approved</h2>
          <p>Your booking for <b>${booking.service.title}</b> with astrologer <b>${booking.astrologerEmail}</b> has been approved.</p>
          <p>Login to your dashboard to chat and manage your booking.</p>
        </div>
      `,
    });
  } else if (status === "rejected") {
    await resend.emails.send({
      from: "Sripatro <notify@sripatro.com>",
      to: [booking.userEmail],
      subject: `Your booking for ${booking.service.title} was rejected`,
      html: `
        <div style='font-family:sans-serif;padding:2rem;'>
          <h2 style='color:#dc2626;'>Booking Rejected</h2>
          <p>We're sorry, but your booking for <b>${booking.service.title}</b> with astrologer <b>${booking.astrologerEmail}</b> was rejected.</p>
          <p>The astrologer is not available at this time.</p>
        </div>
      `,
    });
  } else if (status === "completed") {
    await resend.emails.send({
      from: "Sripatro <notify@sripatro.com>",
      to: [booking.userEmail],
      subject: `Your booking for ${booking.service.title} is completed!`,
      html: `
        <div style='font-family:sans-serif;padding:2rem;'>
          <h2 style='color:#dc2626;'>Booking Completed</h2>
          <p>Your booking for <b>${booking.service.title}</b> with astrologer <b>${booking.astrologerEmail}</b> has been marked as completed.</p>
          <p>Thank you for using Sripatro! We hope you had a great experience.</p>
        </div>
      `,
    });
  }

  return Response.json({ ok: true, status: booking.status });
}
