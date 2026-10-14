import type { Email, EmailAnalysis } from "./types";

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export const MOCK_EMAILS: Email[] = [
  {
    id: "1",
    sender: { name: "Sarah Chen", email: "sarah@brightloop.io" },
    subject: "Production site is down — need help ASAP",
    preview: "Hey, the checkout page started throwing a 500 error about 20 minutes ago and customers can't…",
    body: `Hey,

The checkout page started throwing a 500 error about 20 minutes ago and customers can't complete orders. We're running a promo today so this is costing us real money.

Can you take a look as soon as possible? I've attached the error screenshot from our monitoring dashboard. Happy to jump on a call if that's faster.

Thanks,
Sarah
Head of Product, Brightloop`,
    receivedAt: minutesAgo(18),
    unread: true,
    analysis: {
      category: "urgent",
      priority: 10,
      summary: "Client's checkout page is returning 500 errors during a live promotion and needs an immediate fix.",
      suggestedAction: "Acknowledge within 15 minutes, investigate server logs, and offer a quick call.",
      draft: `Hi Sarah,

Thanks for flagging this — I'm on it right now. I'll dig into the server logs and the latest deploy and send you an update within 30 minutes.

If it's easier, I'm free to jump on a quick call; just send me a link.

Best,
Alex`,
    },
  },
  {
    id: "2",
    sender: { name: "Marcus Webb", email: "marcus@northwind.co" },
    subject: "Invoice #1042 — payment confirmation",
    preview: "Hi Alex, just confirming we've processed payment for invoice #1042. It should land in your…",
    body: `Hi Alex,

Just confirming we've processed payment for invoice #1042 ($4,800). It should land in your account within 2–3 business days.

Also, our finance team asked whether you could switch to monthly invoicing from next quarter. Let me know if that works for you.

Cheers,
Marcus`,
    receivedAt: minutesAgo(95),
    unread: true,
    analysis: {
      category: "invoice",
      priority: 6,
      summary: "Payment for invoice #1042 was sent; client asks about switching to monthly invoicing.",
      suggestedAction: "Confirm receipt once funds clear and reply about monthly invoicing terms.",
      draft: `Hi Marcus,

Thanks for the heads-up on #1042 — much appreciated.

Monthly invoicing from next quarter works for me. I'll send the first one on the 1st of the month with a breakdown of hours.

Best,
Alex`,
    },
  },
  {
    id: "3",
    sender: { name: "Priya Raman", email: "priya@lumenstudio.design" },
    subject: "Website redesign project — are you available?",
    preview: "Hi! I found your portfolio through a friend and love your work. We're a small design studio…",
    body: `Hi!

I found your portfolio through a friend and love your work. We're a small design studio looking for a developer to build out a marketing site in Next.js — roughly 8 pages, with a CMS.

Our timeline is about 6 weeks starting early next month. Would you be available, and could you share a rough estimate?

Warmly,
Priya Raman
Lumen Studio`,
    receivedAt: minutesAgo(60 * 5),
    unread: true,
  },
  {
    id: "4",
    sender: { name: "Daniel Ortiz", email: "dan@fieldnotes.app" },
    subject: "Re: Feedback on the onboarding flow",
    preview: "Thanks for the mockups. I'm going to run them by the team on Thursday and get back to you…",
    body: `Thanks for the mockups.

I'm going to run them by the team on Thursday and get back to you with consolidated feedback by Friday. No action needed until then.

Dan`,
    receivedAt: minutesAgo(60 * 26),
    unread: false,
    analysis: {
      category: "waiting",
      priority: 4,
      summary: "Client is reviewing onboarding mockups with their team and will reply by Friday.",
      suggestedAction: "No reply needed — set a reminder to follow up Friday afternoon.",
      draft: `Hi Dan,

Sounds great — looking forward to the feedback on Friday. Let me know if any questions come up in the meantime.

Best,
Alex`,
    },
  },
  {
    id: "5",
    sender: { name: "Figma", email: "no-reply@figma.com" },
    subject: "Your weekly design digest",
    preview: "See what's new in your team's files this week, including 3 new comments and 2 updated…",
    body: `See what's new in your team's files this week, including 3 new comments and 2 updated components.

— The Figma Team`,
    receivedAt: minutesAgo(60 * 50),
    unread: false,
  },
  {
    id: "6",
    sender: { name: "Hannah Lee", email: "hannah@oakandiron.com" },
    subject: "Overdue: Invoice #1037",
    preview: "Hi Alex, apologies — I just noticed invoice #1037 slipped through. Can you resend the…",
    body: `Hi Alex,

Apologies — I just noticed invoice #1037 slipped through the cracks on our end. Can you resend the PDF? I'll make sure it's paid this week.

Thanks,
Hannah`,
    receivedAt: minutesAgo(60 * 72),
    unread: false,
  },
];

const GENERATED: Record<string, EmailAnalysis> = {
  "3": {
    category: "lead",
    priority: 8,
    summary: "A design studio wants a 6-week Next.js marketing site build and is asking for availability and an estimate.",
    suggestedAction: "Reply within a day with availability, a rough range, and offer a discovery call.",
    draft: `Hi Priya,

Thank you for reaching out — and for the kind words about my work!

I'd love to help with the Lumen Studio site. An 8-page Next.js build with a CMS over ~6 weeks fits well with my schedule starting early next month.

Could we set up a 30-minute call this week to go over scope, the CMS you have in mind, and any design files? I'll follow up with a detailed estimate afterwards.

Best,
Alex`,
  },
  "5": {
    category: "low",
    priority: 1,
    summary: "Automated weekly digest from Figma with no action required.",
    suggestedAction: "Archive — no reply needed.",
    draft: "",
  },
  "6": {
    category: "invoice",
    priority: 7,
    summary: "Client acknowledges invoice #1037 is overdue and asks for the PDF to be resent.",
    suggestedAction: "Resend the invoice PDF today and confirm the payment date.",
    draft: `Hi Hannah,

No problem at all — I've attached invoice #1037 again here. Thanks for making sure it gets taken care of this week.

Best,
Alex`,
  },
};

/** Simulates a call to the local Gemma 3 model. */
export async function mockTriage(email: Email): Promise<EmailAnalysis> {
  await new Promise((resolve) => setTimeout(resolve, 1400));
  return (
    GENERATED[email.id] ??
    email.analysis ?? {
      category: "low",
      priority: 3,
      summary: "General message with no clear action.",
      suggestedAction: "Review when you have time.",
      draft: `Hi ${email.sender.name.split(" ")[0]},\n\nThanks for your email — I'll get back to you shortly.\n\nBest,\nAlex`,
    }
  );
}
