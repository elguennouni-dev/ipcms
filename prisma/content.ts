// Starter articles. Edit, replace or delete them from Admin -> Blog & guides.
export type SeedPost = { type: 'guide' | 'blog'; slug: string; title: string; excerpt: string; category: string; focusKeyword: string; seoTitle: string; seoDescription: string; body: string; faq: string; daysAgo: number };

const TRIAL = `\n\nNot sure yet? [Request the 24-hour free trial](/#order) and we will walk you through setup on WhatsApp.`;

export const POSTS: SeedPost[] = [
  {
    type: 'guide', slug: 'iptv-on-amazon-fire-stick', daysAgo: 12, category: 'Setup guide', focusKeyword: 'iptv fire stick',
    title: 'How to Set Up IPTV on an Amazon Fire Stick',
    seoTitle: 'IPTV Fire Stick Setup: Step-by-Step Guide for UK Viewers',
    seoDescription: 'Set up your IPTV Fire Stick in minutes: install a player app, enter your login details and start watching live TV, sport and films in HD.',
    excerpt: 'A simple, step-by-step guide to getting your IPTV Fire Stick working, from installing a player app to entering your login details.',
    body: `Setting up **IPTV on a Fire Stick** takes about ten minutes. You need your Fire Stick connected to your TV and Wi-Fi, plus the login details we send you on WhatsApp after you order.

## What you need before you start

- An Amazon Fire Stick (any model) or Fire TV, connected to your TV
- A stable internet connection (see our [internet speed guide](/blog/internet-speed-for-iptv-streaming-uk))
- Your subscription details: the server address, username and password we send you

## Step 1: Install an IPTV player app

Your subscription works with a player app. Open the **Find** menu on your Fire Stick, choose **Search** and look for an IPTV player in the official Amazon Appstore. Select it and press **Get** to install. We recommend using only apps from the official store.

## Step 2: Enter your login details

1. Open the player app after it installs.
2. Choose the option to add a playlist or sign in with a username and password.
3. Type in the details from your WhatsApp message exactly as shown.
4. Save, and wait while the channel list loads for the first time.

## Step 3: Start watching

Once the channels load you can browse live TV, sport and on-demand films and series. Use the favourites option to pin the channels you watch most.

## Fire Stick tips for a smooth picture

- Keep the Fire Stick in the HDMI extender it came with, away from the back of the TV, for better Wi-Fi.
- If you can, use an Ethernet adapter for the most stable connection.
- Restart the Fire Stick from **Settings > My Fire TV > Restart** if the app ever feels slow.
${TRIAL}`,
    faq: `Q: Do I need a special Fire Stick?
A: No. Any Fire Stick or Fire TV that can install apps from the Amazon Appstore will work.

Q: Why does the picture buffer?
A: Buffering is usually caused by weak Wi-Fi. Move the router closer, use an Ethernet adapter, or restart the device.

Q: Can I use the same login on my phone?
A: Yes, you can use your subscription on other devices. Check your plan or message us on WhatsApp for the number of connections included.`
  },
  {
    type: 'guide', slug: 'iptv-on-android-tv-smart-tv', daysAgo: 10, category: 'Setup guide', focusKeyword: 'iptv smart tv',
    title: 'How to Watch IPTV on Android TV and Smart TVs',
    seoTitle: 'IPTV Smart TV Setup: Android TV, Samsung, LG Guide',
    seoDescription: 'Learn how to set up IPTV on your smart TV or Android TV box. Install a player app, add your subscription and start watching.',
    excerpt: 'Set up your subscription on Android TV, Google TV and most smart TVs in a few quick steps.',
    body: `Most modern TVs can run an IPTV player app, which makes **IPTV on a smart TV** the easiest way to watch on the big screen.

## Which TVs work?

- **Android TV and Google TV** (Sony, Philips, TCL, Nvidia Shield and many set-top boxes)
- **Samsung (Tizen) and LG (webOS) smart TVs** through the TV's own app store
- Any TV with an HDMI port, using a Fire Stick or Android box (see our [Fire Stick guide](/guides/iptv-on-amazon-fire-stick))

## Step by step on Android TV

1. Open the **Google Play Store** on your TV.
2. Search for an IPTV player app and install it.
3. Open the app and choose to add your subscription with a username and password.
4. Enter the details we sent on WhatsApp and wait for the channels to load.

## Step by step on Samsung and LG

1. Open the TV's app store (Samsung Smart Hub or LG Content Store).
2. Search for a compatible IPTV player and install it.
3. Add your subscription details inside the app.

App availability differs by TV model and year. If you cannot find a player on your TV, an inexpensive Fire Stick or Android box is a reliable alternative.

## Get the best picture

- Set the TV to its **Cinema** or **Movie** picture mode for films and **Standard** for sport.
- Use Ethernet where possible. Wi-Fi is fine for HD, but wired is best for 4K.
${TRIAL}`,
    faq: `Q: My TV does not have an app store. What can I do?
A: Plug in a Fire Stick or Android TV box. It works with any TV that has an HDMI port.

Q: Does it support 4K?
A: 4K channels and films play on 4K-capable TVs with a fast, stable connection.`
  },
  {
    type: 'guide', slug: 'iptv-on-iphone-ipad', daysAgo: 8, category: 'Setup guide', focusKeyword: 'iptv iphone',
    title: 'How to Set Up IPTV on iPhone and iPad',
    seoTitle: 'IPTV iPhone and iPad Setup Guide (UK)',
    seoDescription: 'Watch live TV and on-demand films on your iPhone or iPad. Install a player app from the App Store and add your subscription details.',
    excerpt: 'Watch on the move: install a player from the App Store and add your login details in a couple of minutes.',
    body: `Watching **IPTV on an iPhone or iPad** is quick, and it is a good way to follow live sport when you are away from the TV.

## Step 1: Install a player app

Open the **App Store**, search for an IPTV player and install it. Choose an app with good recent reviews that supports logging in with a username and password.

## Step 2: Add your subscription

1. Open the app and tap the option to add a new playlist or login.
2. Enter the server address, username and password from your WhatsApp message.
3. Save and let the channel list load.

## Step 3: Watch anywhere

Your subscription works over Wi-Fi at home and on mobile data. Watching on mobile data uses a lot of data, so use Wi-Fi where you can.

## Tips for iPhone and iPad

- Turn on **Picture in Picture** to keep watching while you use another app.
- Use **AirPlay** to send the picture to an Apple TV or compatible smart TV.
- Keep iOS and the player app up to date for the best performance.
${TRIAL}`,
    faq: `Q: Can I cast to my TV?
A: Yes. Use AirPlay to send the stream to an Apple TV or an AirPlay-compatible TV.

Q: Does it work on mobile data?
A: Yes, but streaming uses a lot of data. Wi-Fi is recommended.`
  },
  {
    type: 'guide', slug: 'iptv-on-windows-mac', daysAgo: 6, category: 'Setup guide', focusKeyword: 'iptv on pc',
    title: 'How to Watch IPTV on Windows and Mac',
    seoTitle: 'IPTV on PC and Mac: Easy Setup Guide for the UK',
    seoDescription: 'Set up IPTV on your Windows PC or Mac with a free media player. Add your subscription details and start watching in minutes.',
    excerpt: 'Use a free media player on your computer to watch your subscription on a laptop or desktop.',
    body: `You can watch **IPTV on a PC or Mac** with a free media player. It is ideal for a spare monitor, a laptop or a quick test before you set up the TV.

## What you need

- A Windows 10/11 PC or a Mac
- A free player that supports network playlists, downloaded from the developer's official website
- The login details we send on WhatsApp

## Step by step

1. Download and install a trusted media player from its official website.
2. Open the player and choose to open a network stream or add a playlist.
3. Paste the address we sent you and confirm.
4. The channel list loads. Pick a channel to start watching.

## Tips for computers

- Close other bandwidth-heavy tabs or downloads while watching.
- Use full-screen mode and your system's **Night light** setting for late-evening viewing.
- Use a wired connection if you plan to watch in 4K.
${TRIAL}`,
    faq: `Q: Which player should I use?
A: Any reputable media player that supports network playlists. Always download from the developer's official website.`
  },
  {
    type: 'blog', slug: 'how-to-choose-iptv-subscription-uk', daysAgo: 4, category: 'Buying advice', focusKeyword: 'iptv subscription uk',
    title: 'How to Choose an IPTV Subscription in the UK: 7 Things to Check',
    seoTitle: 'IPTV Subscription UK: 7 Things to Check Before You Buy',
    seoDescription: 'Choosing an IPTV subscription in the UK? Check licensing, free trial, device support, support quality, pricing and refunds before you pay.',
    excerpt: 'Before you pay for any streaming service, run through this checklist. It takes five minutes and can save you money and frustration.',
    body: `Buying an **IPTV subscription in the UK** should be simple, but the market is crowded. Use this checklist to compare providers and avoid common problems.

## 1. Is the seller a legitimate business?

Look for a registered company name and number, a clear refund policy, terms and a way to contact a real person. A seller that hides who they are is a warning sign. Our own details are on the [contact page](/legal/contact).

## 2. Is there a free trial?

A short trial is the best way to test channels, picture quality and your own devices before you commit. Our [24-hour free trial](/#order) is there for exactly that.

## 3. Does it work on your devices?

Check support for your TV, Fire Stick, phone or computer. Our [setup guides](/guides) cover the most common devices.

## 4. How good is the support?

Ask a question before you buy and see how quickly a human answers. Fast WhatsApp support makes setup far easier.

## 5. What does the price include?

Compare the monthly cost across plan lengths. Longer plans usually cost less per month, but only commit after a trial. See our [plans and pricing](/#plans).

## 6. Is the refund policy clear?

You should know what happens if the service does not work on your device. Read the [refund policy](/legal/refunds) before paying.

## 7. Is your internet fast enough?

Even the best service buffers on a weak connection. Read our guide to [internet speed for streaming](/blog/internet-speed-for-iptv-streaming-uk).

## Quick checklist

- Real business details and policies
- Free trial available
- Works on your devices
- Responsive support
- Clear pricing and refunds

Ready to try? [Request the 24-hour free trial](/#order).`,
    faq: `Q: How long should a trial be?
A: At least a few hours, ideally a full day, so you can test live sport, films and your devices.

Q: Should I pay for a long plan straight away?
A: Start with a trial or a short plan. Move to a longer plan once you are happy.`
  },
  {
    type: 'blog', slug: 'internet-speed-for-iptv-streaming-uk', daysAgo: 2, category: 'Tips', focusKeyword: 'internet speed for streaming',
    title: 'Internet Speed for Streaming: What You Need for HD and 4K',
    seoTitle: 'Internet Speed for Streaming: HD and 4K Requirements',
    seoDescription: 'What internet speed do you need for HD and 4K streaming? A simple guide for UK homes, with tips to stop buffering.',
    excerpt: 'Buffering is almost always a connection problem. Here is the speed you need and how to fix the common causes.',
    body: `The right **internet speed for streaming** depends on picture quality and how many screens are in use at the same time.

## How much speed do you need?

As a safe rule of thumb for each stream:

- **SD and mobile:** around 3 to 5 Mbps
- **HD (1080p):** around 10 Mbps
- **4K Ultra HD:** around 25 Mbps

Add the speed for every device streaming at once. A family watching on three screens needs a comfortable margin on top of that total.

## Check your real speed

Run a speed test on the device you watch on, not just on your computer. Test near the TV and at the time of day you usually watch. Evening speeds are often lower than the figure on your bill.

## How to stop buffering

1. **Use Ethernet** if you can. A cable beats Wi-Fi for 4K.
2. **Move the router** to a central, open spot, away from walls and appliances.
3. **Use the 5 GHz band** for streaming devices that are close to the router.
4. **Restart** the router, the TV and the app.
5. **Limit other downloads** while you watch live sport.

## When to upgrade your broadband

If a speed test regularly shows less than you need, contact your provider or consider a fibre package. Most UK homes can get fibre to the premises or full-fibre now.

Want to test your setup first? [Try the free 24-hour trial](/#order) and follow our [Fire Stick guide](/guides/iptv-on-amazon-fire-stick) or [smart TV guide](/guides/iptv-on-android-tv-smart-tv).`,
    faq: `Q: Is Wi-Fi good enough for 4K?
A: Often yes with a strong 5 GHz signal, but a cable is the most reliable choice.

Q: Why does it buffer only in the evening?
A: Networks are busiest in the evening. A faster package or a wired connection usually helps.`
  }
];

export const EXTRA_FAQS: [string, string][] = [
  ['What internet speed do I need?', 'About 10 Mbps per stream for HD and 25 Mbps for 4K. A wired connection gives the most stable picture.'],
  ['How many devices can I use?', 'The number of simultaneous connections depends on your plan. Message us on WhatsApp and we will confirm it before you order.'],
  ['Can I use it outside the UK?', 'Service is intended for customers in the United Kingdom. Ask us on WhatsApp if you travel and we will advise.'],
  ['What if I have a problem after buying?', 'Message us on WhatsApp. A real person will help you fix setup and playback issues, and our refund policy applies.'],
  ['Do I need to create an account on the website?', 'No. There is no account to create. Send the short order form or message us directly.']
];
