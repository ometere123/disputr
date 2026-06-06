import { notifications, users, type DbClient } from "@disputr/db";
import { eq } from "drizzle-orm";
import { sendTransactionalEmail } from "@/lib/server/email";

type NotifyInput = {
  userId: string;
  type: string;
  title: string;
  body: string;
  href?: string;
  payload?: Record<string, unknown>;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function emailHtml(input: NotifyInput) {
  const hrefValue = input.href ? absoluteUrl(input.href) : undefined;
  const href = hrefValue ? `<p><a href="${escapeHtml(hrefValue)}">Open in Disputr</a></p>` : "";
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2a160f">
      <h2 style="margin:0 0 12px">${escapeHtml(input.title)}</h2>
      <p style="margin:0 0 16px">${escapeHtml(input.body)}</p>
      ${href}
      <p style="margin-top:24px;color:#8b786c;font-size:12px">You are receiving this because email notifications are enabled in Disputr.</p>
    </div>
  `;
}

function absoluteUrl(href: string) {
  if (/^https?:\/\//.test(href)) {
    return href;
  }

  const origin = process.env.NEXTAUTH_URL || process.env.AUTH_URL;
  if (!origin) {
    return undefined;
  }

  return new URL(href, origin).toString();
}

export async function notifyUser(db: DbClient, input: NotifyInput) {
  const [user] = await db
    .select({
      email: users.email,
      notificationInApp: users.notificationInApp,
      notificationEmail: users.notificationEmail
    })
    .from(users)
    .where(eq(users.id, input.userId))
    .limit(1);

  if (!user) {
    return { inApp: false, email: false as const };
  }

  let inApp = false;
  if (user.notificationInApp) {
    await db.insert(notifications).values({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href,
      payload: input.payload ?? {}
    });
    inApp = true;
  }

  if (!user.notificationEmail || !user.email) {
    return { inApp, email: false as const };
  }

  const email = await sendTransactionalEmail({
    to: user.email,
    subject: `Disputr: ${input.title}`,
    text: `${input.title}\n\n${input.body}${input.href ? `\n\nOpen: ${absoluteUrl(input.href) ?? input.href}` : ""}`,
    html: emailHtml(input)
  });

  return { inApp, email };
}
