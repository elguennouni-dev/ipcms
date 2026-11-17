import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

const TEMPLATE_NOTE = '> TEMPLATE: replace the [bracketed] parts and have this reviewed by a qualified solicitor before publishing.\n\n';

const legal = [
  ['terms', 'Terms of Service', TEMPLATE_NOTE + `## 1. About us
[Your Company Ltd] ("we", "us") is a company registered in England & Wales (no. [00000000]). We resell third-party streaming subscriptions to customers in the United Kingdom.

## 2. The service
- Subscriptions are provided for personal, non-commercial use.
- Availability of channels and content may change without notice and varies by plan.
- You must not share, resell or redistribute your login without our written permission.

## 3. Orders and payment
Orders are confirmed by us on WhatsApp. Prices are shown in GBP. We will tell you the available payment methods when we confirm your order.

## 4. Free trial
A 24-hour trial may be offered once per household. We may refuse repeat trial requests.

## 5. Acceptable use
You must not use the service for any unlawful purpose or to infringe anyone's rights. We may suspend accounts that breach these terms.

## 6. Liability
Nothing limits liability that cannot be limited by law. Otherwise, the service is provided "as is" and our liability is limited to the amount you paid for the current subscription period.

## 7. Contact
[Support email] - [WhatsApp number]`],
  ['privacy', 'Privacy Policy', TEMPLATE_NOTE + `## 1. Who we are
[Your Company Ltd] is the data controller for personal data collected through this website.

## 2. What we collect
- Name and WhatsApp number (and email if you provide it) when you place an order.
- Technical data such as IP address and browser type, and analytics data if you accept analytics cookies.

## 3. Why we use it (UK GDPR)
- To process your order and contact you (contract).
- To keep the site secure and prevent abuse (legitimate interests).
- To measure and improve the site (consent).

## 4. Sharing and retention
We do not sell your data. We share it only with service providers needed to run the business. We keep order records for [X] years.

## 5. Your rights
You can ask to access, correct or delete your data, or object to processing. Contact [privacy email]. You can also complain to the Information Commissioner's Office (ico.org.uk).`],
  ['refunds', 'Refund Policy', TEMPLATE_NOTE + `## Free trial
Try the service for 24 hours before you buy.

## Refunds
[Describe your refund window and conditions here, for example: if the service does not work on your device and we cannot fix it within [X] days, you can request a refund.]

## How to request
Message us on WhatsApp or email [support email] with your order details.

## Consumer rights
Your statutory rights are not affected.`],
  ['dmca', 'DMCA / Copyright Policy', TEMPLATE_NOTE + `We respect intellectual property rights. We resell third-party subscription services and do not upload or host the underlying content. If you believe material accessible through our service infringes your copyright, send us a notice.

## What your notice must include
- Your full legal name, address, phone number and email address.
- Identification of the copyrighted work you claim has been infringed.
- Identification of the material you claim is infringing, with enough detail to locate it (for example a channel name or URL).
- A statement that you have a good-faith belief that the use is not authorised by the copyright owner, its agent or the law.
- A statement, under penalty of perjury, that the information is accurate and that you are the owner or authorised to act for the owner.
- Your physical or electronic signature.

## Designated copyright agent
Email: [DMCA email] - Address: [registered address, United Kingdom]

## What happens next
We will review valid notices, remove or disable access to the identified material where appropriate, and may notify the relevant customer. Customers may send a counter-notice if they believe material was removed in error. Repeat infringers will have their subscriptions terminated.`],
  ['cookies', 'Cookie Policy', TEMPLATE_NOTE + `## What are cookies
Small files stored on your device when you visit a website.

## Cookies we use
- Essential: needed for the site and the admin area to work.
- Analytics (only with your consent): help us understand how the site is used.

## Managing cookies
Use the banner shown on your first visit, or clear cookies in your browser settings.`],
  ['contact', 'Contact', `## Get in touch
- WhatsApp: [number]
- Email: [support email]
- Copyright notices: [DMCA email]

[Your Company Ltd] - Company no. [00000000] - [Registered address, United Kingdom]`]
];

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'change-me-now';
  const passwordHash = await bcrypt.hash(password, 12);
  await db.adminUser.upsert({ where: { email }, update: {}, create: { email, passwordHash, name: 'Owner', role: 'owner' } });

  const feats = 'Full channel & VOD library\nHD & 4K streams\nWorks on all devices\nWhatsApp support';
  const plans = [
    ['1m', '1 Month', 1, 12, '', 0],
    ['3m', '3 Months', 3, 30, '', 1],
    ['6m', '6 Months', 6, 50, 'MOST POPULAR', 2],
    ['12m', '12 Months', 12, 85, 'BEST VALUE', 3]
  ] as const;
  for (const [slug, name, months, price, badge, sort] of plans) {
    await db.plan.upsert({ where: { slug }, update: {}, create: { slug, name, months, price, badge, features: feats, sort } });
  }

  const sections = [
    ['hero', 'Hero', 'Headline, buttons and poster collage'],
    ['stats', 'Stats strip', 'Channels, quality, support'],
    ['features', 'Features', 'Four benefit cards'],
    ['channels', 'Channel logos', 'Grid of channel artwork'],
    ['sport', 'Live sport banner', 'Wide promo image'],
    ['vod', 'Movies & series', 'Poster wall'],
    ['devices', 'Devices', 'Watch anywhere'],
    ['plans', 'Plans & trial', 'Pricing cards and free trial'],
    ['how', 'How it works', 'Three steps'],
    ['reviews', 'Reviews', 'Customer testimonials'],
    ['order', 'Order form', 'Name, WhatsApp, optional email'],
    ['faq', 'FAQ', 'Accordion questions']
  ];
  for (let i = 0; i < sections.length; i++) {
    const [key, name, descr] = sections[i];
    await db.section.upsert({ where: { key }, update: {}, create: { key, name, descr, sort: i, visible: key !== 'reviews' } });
  }

  const faqs = [
    ['How does the order process work?', 'Choose a plan and send the short form, or message us directly on WhatsApp. We reply with your login details and a simple setup guide.'],
    ['What devices are supported?', 'Most smart TVs, Amazon Fire Stick, Android and iOS devices, MAG boxes, and Windows or Mac computers.'],
    ['How does the free trial work?', 'Request a 24-hour trial, receive your details on WhatsApp and test everything. If you like it, upgrade to any plan.'],
    ['How do I pay?', 'We share the available payment options with you on WhatsApp once your request is confirmed.']
  ];
  if ((await db.faqItem.count()) === 0) {
    for (let i = 0; i < faqs.length; i++) await db.faqItem.create({ data: { question: faqs[i][0], answer: faqs[i][1], sort: i } });
  }

  for (const [slug, title, body] of legal) {
    await db.legalPage.upsert({ where: { slug }, update: {}, create: { slug, title, body } });
  }

  const slots: [string, string][] = [
    ['hero', 'Hero image (optional)'],
    ['sport-banner', 'Live sport banner (1200x340)'],
    ['devices', 'Devices image (1000x625)'],
    ['logo', 'Logo override (wide, ~900x300, transparent PNG/WebP)'],
    ['og', 'Social share image (1200x630)']
  ];
  for (let i = 1; i <= 12; i++) slots.push([`channel-${i}`, `Channel logo ${i} (320x200)`]);
  for (let i = 1; i <= 12; i++) slots.push([`poster-${i}`, `Poster ${i} (600x900)`]);
  for (const [slot, label] of slots) await db.media.upsert({ where: { slot }, update: { label }, create: { slot, label } });

  console.log('Seed complete. Admin:', email);
}

main().finally(() => db.$disconnect());
