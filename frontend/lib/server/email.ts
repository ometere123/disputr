import nodemailer, { type Transporter } from "nodemailer";

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

type EmailResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "send_failed" };

let transporter: Transporter | null = null;

export function formatEmailFrom(value?: string) {
  const raw = value?.trim();
  if (!raw) {
    return undefined;
  }

  if (/^.+<[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+>$/.test(raw) || /^[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+$/.test(raw)) {
    return raw;
  }

  const email = raw.match(/[^\s<>]+@[^\s<>]+\.[^\s<>]+/)?.[0];
  if (!email) {
    return undefined;
  }

  const name = raw.replace(email, "").trim();
  if (!name) {
    return email;
  }

  return `"${name.replaceAll('"', "'")}" <${email}>`;
}

export function isEmailConfigured() {
  return Boolean(process.env.EMAIL_SERVER && formatEmailFrom(process.env.EMAIL_FROM));
}

export async function sendTransactionalEmail(payload: EmailPayload): Promise<EmailResult> {
  const from = formatEmailFrom(process.env.EMAIL_FROM);
  const server = process.env.EMAIL_SERVER;

  if (!from || !server) {
    return { ok: false, reason: "not_configured" };
  }

  try {
    transporter ??= nodemailer.createTransport(server);
    await transporter.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: "send_failed" };
  }
}
