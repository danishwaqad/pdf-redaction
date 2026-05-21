import { NextResponse } from "next/server";
import { CONTACT_EMAIL } from "@/lib/site-contact";

export const runtime = "nodejs";

function pickString(form: FormData, key: string): string | null {
  const v = form.get(key);
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendViaResend(name: string, email: string, message: string): Promise<Response> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: `Email ${CONTACT_EMAIL} directly.` },
      { status: 503 }
    );
  }

  const from = process.env.RESEND_FROM ?? "RedactPDF <onboarding@resend.dev>";
  const subject = `RedactPDF contact from ${name}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [CONTACT_EMAIL],
      reply_to: email,
      subject,
      text: `${message}\n\n— ${name} (${email})`,
      html: `<p>${escapeHtml(message).replace(/\n/g, "<br>")}</p><p>— <strong>${escapeHtml(name)}</strong> (<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>)</p>`,
    }),
  });

  if (res.ok) {
    return NextResponse.json({ ok: true });
  }

  let detail = "Could not send message.";
  try {
    const j = (await res.json()) as { message?: string };
    if (j.message) detail = j.message;
  } catch {
    /* ignore */
  }
  return NextResponse.json({ error: detail }, { status: 502 });
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const name = pickString(form, "name");
  const email = pickString(form, "email");
  const message = pickString(form, "message");

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  if (process.env.RESEND_API_KEY) {
    try {
      return await sendViaResend(name, email, message);
    } catch {
      return NextResponse.json({ error: "Contact service unavailable." }, { status: 503 });
    }
  }

  const formspreeId = process.env.FORMSPREE_ID ?? process.env.NEXT_PUBLIC_FORMSPREE_ID;
  if (formspreeId) {
    const upstream = new FormData();
    upstream.append("name", name);
    upstream.append("email", email);
    upstream.append("message", message);
    upstream.append("_subject", `RedactPDF contact from ${name}`);
    upstream.append("_replyto", email);

    try {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        body: upstream,
        headers: { Accept: "application/json" },
      });
      if (res.ok) return NextResponse.json({ ok: true });
      const err = await res.text().catch(() => "");
      return NextResponse.json({ error: err || "Could not send message." }, { status: 502 });
    } catch {
      return NextResponse.json({ error: "Contact service unavailable." }, { status: 503 });
    }
  }

  const web3Key = process.env.WEB3FORMS_ACCESS_KEY;
  if (web3Key) {
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: web3Key,
          name,
          email,
          message,
          subject: `RedactPDF contact from ${name}`,
          from_name: "RedactPDF Contact Form",
        }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (res.ok && data.success) return NextResponse.json({ ok: true });
      return NextResponse.json({ error: data.message || "Could not send message." }, { status: 502 });
    } catch {
      return NextResponse.json({ error: "Contact service unavailable." }, { status: 503 });
    }
  }

  return NextResponse.json(
    { error: `Form not configured. Email ${CONTACT_EMAIL} directly.` },
    { status: 503 }
  );
}
