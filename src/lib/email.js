import nodemailer from "nodemailer";

let transporterPromise;

function getTransporter() {
  if (!transporterPromise) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      transporterPromise = Promise.resolve(
        nodemailer.createTransport({
          host: SMTP_HOST,
          port: Number(SMTP_PORT) || 587,
          secure: false,
          auth: { user: SMTP_USER, pass: SMTP_PASS },
        })
      );
    } else {
      transporterPromise = Promise.resolve({
        sendMail: async (opts) => {
          console.log("[EMAIL:FAKE]", { to: opts.to, subject: opts.subject });
          return { messageId: "fake-id" };
        },
      });
    }
  }
  return transporterPromise;
}

export async function sendEmail({ to, subject, html, text }) {
  const transporter = await getTransporter();
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || "SriPatro <no-reply@sripatro.com>",
    to,
    subject,
    html,
    text: text || html?.replace(/<[^>]+>/g, " "),
  });
}

export function renderVerificationEmail({ site, token, locale }) {
  const url = `${site}/${locale || "en"}/blog/confirm/${token}`;
  return {
    subject: "Confirm your subscription",
    html: `<h1>Confirm your subscription</h1><p><a href="${url}">Click here to confirm</a></p><p>${url}</p>`,
  };
}

export function renderWeeklyDigestEmail({ site, posts, unsubscribeUrl }) {
  const list = posts
    .map(
      (p) =>
        `<li><a href="${site}/${p.meta.locale}/blog/${p.meta.slug}">${p.meta.title}</a></li>`
    )
    .join("");
  return {
    subject: `SriPatro Weekly Digest (${posts.length} post${posts.length !== 1 ? "s" : ""})`,
    html: `<h1>This Week on SriPatro</h1><ul>${list}</ul><p style="font-size:12px;color:#666">Unsubscribe: <a href="${unsubscribeUrl}">${unsubscribeUrl}</a></p>`,
  };
}
