export const dictionary = {
  brandName: "Afkar AlDar",
  tagline: "Thoughtfully Curated. Beautifully Yours.",
  subTagline: "Custom gift boxes, designed with love and crafted to make every moment unforgettable across Dubai & the UAE.",

  navigation: {
    home: "HOME",
    occasions: "OCCASIONS",
    howItWorks: "HOW IT WORKS",
    inspiration: "INSPIRATION",
    about: "ABOUT US",
    faq: "FAQ",
    orderNow: "ORDER NOW",
  },

  hero: {
    badge: "THOUGHTFULLY CURATED. BEAUTIFULLY YOURS.",
    headlinePart1: "Gift More Than",
    headlinePart2: "a Box.",
    headlinePart3: "Gift a Feeling.",
    subheadline: "Custom luxury gift boxes, designed with love and crafted to make every moment unforgettable in Dubai & UAE.",
    primaryCta: "DESIGN YOUR BOX NOW",
    secondaryCta: "EXPLORE DESIGNS",
    reviews: "Loved by 10,000+ happy clients",
    rating: "4.9/5",
  },

  valueProps: [
    {
      title: "FULLY CUSTOMIZABLE",
      description: "Choose everything from box velvet color to curated contents and handwritten card message.",
    },
    {
      title: "PREMIUM LUXURY QUALITY",
      description: "Luxury packaging and handpicked artisanal gifts that create unforgettable wow moments.",
    },
    {
      title: "EXPRESS UAE DELIVERY",
      description: "On-time white-glove delivery across Dubai, Abu Dhabi, Sharjah & all UAE Emirates.",
    },
    {
      title: "PERFECT FOR ANY OCCASION",
      description: "Weddings, milestone birthdays, new baby celebrations, corporate galas & more.",
    },
    {
      title: "MADE WITH LOVE",
      description: "Every bespoke box is crafted with care to make your loved ones feel truly special.",
    },
  ],

  occasions: {
    title: "SHOP BY OCCASION",
    items: [
      { slug: "birthday", name: "Birthday", image: "/occasions/birthday.png" },
      { slug: "wedding", name: "Wedding & Engagement", image: "/occasions/wedding.png" },
      { slug: "graduation", name: "Graduation", image: "/occasions/graduation.png" },
      { slug: "new-baby", name: "New Baby", image: "/occasions/new-baby.png" },
      { slug: "corporate", name: "Corporate Gifts", image: "/occasions/corporate.png" },
      { slug: "just-because", name: "Just Because", image: "/occasions/just-because.png" },
    ],
  },

  howItWorks: {
    title: "HOW IT WORKS",
    steps: [
      {
        step: "1",
        title: "CHOOSE AN OCCASION",
        description: "Pick the occasion that best matches your special celebration.",
      },
      {
        step: "2",
        title: "CUSTOMIZE YOUR BOX",
        description: "Select box velvet color, ribbon accents, curated items & gold foil message.",
      },
      {
        step: "3",
        title: "RECEIVE WITH JOY",
        description: "We handcraft your gift with love and deliver it directly to your recipient.",
      },
    ],
  },

  testimonials: {
    title: "WHAT OUR VIP CLIENTS SAY",
    items: [
      {
        quote: "The velvet packaging and gold foil calligraphy are absolute perfection! My sister loved her anniversary gift box.",
        author: "Sarah A.",
        location: "Dubai, Jumeirah",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
      },
      {
        quote: "Superb quality, handpicked artisanal items, and express same-day delivery in DIFC. Highly recommended!",
        author: "Tariq H.",
        location: "Dubai, DIFC",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
      },
      {
        quote: "Ordered corporate luxury gift boxes for our end-of-year gala and all our VIP guests were blown away.",
        author: "Mariam M.",
        location: "Abu Dhabi",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
      },
    ],
  },

  footer: {
    about: "We create customized luxury gift boxes that turn special moments into lifelong memories.",
    whatsapp: "+971 50 123 4567",
    email: "support@afkaraldar.ae",
    hours: "Mon - Sat: 9AM - 8PM",
    copyright: "© 2026 Afkar AlDar. All Rights Reserved. Made with ❤️ by Mina Makram",
  },
};

export function formatCurrency(amount: number | string, currency: string = "AED"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return `${currency || "AED"} 0.00`;
  const symbol = currency === "INR" ? "₹" : currency || "AED";
  return `${symbol} ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
