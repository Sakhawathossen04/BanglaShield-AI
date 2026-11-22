// ---------------------------------------------------------------------------
// Seed: verified resources + clearly-labeled SYNTHETIC demonstration data
// (reports / patterns / reviews / audit). Synthetic rows carry synthetic=true
// and the UI labels them as simulation data.
// Run: bun prisma/seed.ts
// ---------------------------------------------------------------------------

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/crypto";
import { SCAM_CATEGORIES } from "../src/lib/types";

const db = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * DAY);

async function main() {
  console.log("Seeding BanglaShield database...");

  // ---- clean (demo reset) ----
  await db.auditEvent.deleteMany();
  await db.humanReview.deleteMany();
  await db.patternEdge.deleteMany();
  await db.fraudPattern.deleteMany();
  await db.report.deleteMany();
  await db.evidenceItem.deleteMany();
  await db.consentRecord.deleteMany();
  await db.feedback.deleteMany();
  await db.analysisSession.deleteMany();
  await db.learningProgress.deleteMany();
  await db.verifiedResource.deleteMany();
  await db.user.deleteMany();

  // ---- analyst user ----
  const analyst = await db.user.create({
    data: {
      email: "analyst@banglashield.org",
      name: "Demo Analyst",
      role: "analyst",
      passwordHash: hashPassword("Shield#2025"),
    },
  });
  console.log("  analyst user created (demo credentials)");

  // ---- verified resources (each with source + verification date) ----
  const resources = [
    {
      key: "bkash",
      name: { bn: "বিকাশ (bKash)", en: "bKash" },
      category: "mfs",
      description: {
        bn: "বিকাশ সম্পর্কিত জালিয়াতির অভিযোগ, অ্যাকাউন্ট বন্ধ বা সন্দেহজনক লেনদেনের খবর বিকাশের নিজস্ব চ্যানেলে জানান।",
        en: "Report bKash-related fraud, account blocks, or suspicious transactions through bKash's own channels.",
      },
      guidance: {
        bn: "বিকাশ অ্যাপের মেনু থেকে 'হেল্প' বা হেল্পলাইন ১৬২৪৭ (নিজে থেকে কল করুন)। বার্তায় আসা নম্বরে কল করবেন না।",
        en: "Use in-app Help or dial 16247 yourself. Never call numbers that came inside a message.",
      },
      url: "https://www.bkash.com/bn/page/fraud-awareness",
      phone: "16247",
      sourceUrl: "https://www.bkash.com/bn/page/fraud-awareness",
    },
    {
      key: "nagad",
      name: { bn: "নগদ (Nagad)", en: "Nagad" },
      category: "mfs",
      description: {
        bn: "নগদ সংক্রান্ত প্রতারণা বা সন্দেহজনক কার্যক্রমের অভিযোগ জানানোর অফিসিয়াল চ্যানেল।",
        en: "Official channel for reporting Nagad-related fraud or suspicious activity.",
      },
      guidance: {
        bn: "নগদ অ্যাপের সাপোর্ট সেকশন ব্যবহার করুন বা নিজে হেল্পলাইনে কল করুন।",
        en: "Use the Nagad app support section or call the helpline yourself.",
      },
      url: "https://www.nagad.com.bd/contact/",
      phone: "16167",
      sourceUrl: "https://www.nagad.com.bd/contact/",
    },
    {
      key: "bangladesh-bank",
      name: { bn: "বাংলাদেশ ব্যাংক", en: "Bangladesh Bank" },
      category: "regulator",
      description: {
        bn: "কেন্দ্রীয় ব্যাংকের যোগাযোগ ও অভিযোগ চ্যানেল — ব্যাংক জালিয়াতি ও আর্থিক প্রতারণার অভিযোগ জানাতে।",
        en: "Central bank contact and complaint channel — for banking fraud and financial scam complaints.",
      },
      guidance: {
        bn: "অভিযোগ বাংলাদেশ ব্যাংকের অফিসিয়াল ওয়েবসাইটের যোগাযোগ পাতা থেকে জানান।",
        en: "File complaints via the contact page on Bangladesh Bank's official website.",
      },
      url: "https://www.bb.org.bd/en/index.php/about/contact",
      phone: null,
      sourceUrl: "https://www.bb.org.bd/en/index.php/about/contact",
    },
    {
      key: "police",
      name: { bn: "বাংলাদেশ পুলিশ", en: "Bangladesh Police" },
      category: "police",
      description: {
        bn: "সাইবার অপরাধসহ যেকোনো অপরাধমূলক ঘটনার অভিযোগ — জরুরি সেবায় ৯৯৯।",
        en: "Report crimes including cybercrime — emergency service 999.",
      },
      guidance: {
        bn: "জরুরি প্রয়োজনে ৯৯৯-এ কল করুন। অভিযোগ বা তথ্যের জন্য police.gov.bd ব্যবহার করুন।",
        en: "Call 999 in emergencies. Use police.gov.bd for complaints and information.",
      },
      url: "https://www.police.gov.bd/",
      phone: "999",
      sourceUrl: "https://www.police.gov.bd/",
    },
    {
      key: "cirt",
      name: { bn: "বিজিডি ই-গভর্নমেন্ট সিআইআরটি", en: "BGD e-GOV CIRT" },
      category: "cert",
      description: {
        bn: "জাতীয় সাইবার নিরাপত্তা দল — সাইবার ঘটনা, ম্যালওয়্যার, ফিশিং সাইটের অভিযোগ জানানোর চ্যানেল।",
        en: "National cybersecurity team — channel for reporting cyber incidents, malware, and phishing sites.",
      },
      guidance: {
        bn: "cirt.gov.bd-এর ইনসিডেন্ট রিপোর্টিং চ্যানেল ব্যবহার করুন। ফিশিং লিংক পেলে সেখানে জানান।",
        en: "Use the incident reporting channel at cirt.gov.bd. Report phishing links there.",
      },
      url: "https://www.cirt.gov.bd/",
      phone: null,
      sourceUrl: "https://www.cirt.gov.bd/",
    },
  ];

  for (let i = 0; i < resources.length; i++) {
    const r = resources[i];
    await db.verifiedResource.create({
      data: {
        key: r.key,
        name: r.name as unknown as object,
        category: r.category,
        description: r.description as unknown as object,
        guidance: r.guidance as unknown as object,
        url: r.url,
        phone: r.phone,
        sourceUrl: r.sourceUrl,
        verifiedAt: new Date(),
        sort: i,
      },
    });
  }
  console.log(`  ${resources.length} verified resources`);

  // ---- SYNTHETIC community reports (labeled synthetic=true) ----
  const reports = [
    {
      id: "RPT-7K2M9QXA",
      days: 2,
      category: "otp_phishing",
      risk: "HIGH_RISK",
      content:
        "“প্রিয় গ্রাহক, আপনার bKash অ্যাকাউন্ট সাসপেন্ড হতে চলেছে। একাউন্ট চালু রাখতে এখনই [মোবাইল ••••৪৫২১] নম্বরে কল করে OTP দিন। — bKash টিম”",
      indicators: { phone: "****4521", domain: null, phrases: ["OTP দিন", "bKash টিম", "সাসপেন্ড"] },
      status: "pending",
    },
    {
      id: "RPT-3XK8L2PB",
      days: 4,
      category: "otp_phishing",
      risk: "HIGH_RISK",
      content:
        "“আমি বিকাশ ম্যানেজার বলছি, আপনার একাউন্টে সন্দেহজনক লেনদেন হয়েছে। নিরাপত্তার জন্য আপনার সিক্রেট কোড আর ওটিপি টা এক্ষুনি বলুন।”",
      indicators: { phone: "****4521", domain: null, phrases: ["সিক্রেট কোড", "ওটিপি", "সন্দেহজনক লেনদেন"] },
      status: "under_review",
    },
    {
      id: "RPT-9QW4N7TC",
      days: 7,
      category: "otp_phishing",
      risk: "HIGH_RISK",
      content:
        "“বিকাশ থেকে বলছি, আপনার একাউন্টে ক্যাশ আউট লিমিট বাড়ানোর জন্য ক্যাশ আউট পিন টা এক্ষুনি বলে দিন।”",
      indicators: { phone: "****8817", domain: null, phrases: ["ক্যাশ আউট পিন", "এক্ষুনি"] },
      status: "published",
    },
    {
      id: "RPT-2MN5J8KD",
      days: 9,
      category: "threat_extortion",
      risk: "HIGH_RISK",
      content:
        "“গোয়েন্দা দপ্তর থেকে বলছি, আপনার নামে মামলা হয়েছে। গ্রেপ্তার এড়াতে আজ রাতের মধ্যেই চার্জশিট ফি পাঠান [মোবাইল ••••৩৩০৯] নম্বরে।”",
      indicators: { phone: "****3309", domain: null, phrases: ["গ্রেপ্তার", "মামলা", "চার্জশিট ফি"] },
      status: "pending",
    },
    {
      id: "RPT-5TR8V2LE",
      days: 11,
      category: "fake_job",
      risk: "HIGH_RISK",
      content:
        "“DGHS তে ডাটা এন্ট্রি অফিসার নিয়োগ বিজ্ঞপ্তি। বেতন ২৫,০০০ টাকা। আবেদন করতে রেজিস্ট্রেশন ফি ৩০০ টাকা পার্সোনাল নম্বরে পাঠান।”",
      indicators: { phone: "****7742", domain: "dghs-job.online", phrases: ["নিয়োগ বিজ্ঞপ্তি", "রেজিস্ট্রেশন ফি"] },
      status: "published",
    },
    {
      id: "RPT-8HY6C4MF",
      days: 14,
      category: "fake_job",
      risk: "HIGH_RISK",
      content:
        "“ফেসবুক থেকে সরাসরি মেসেজ: অনলাইনে টাইপিং জব, মাসে ১৫,০০০ আয়। ফর্ম ফিলাপ ফি ১৫০ টাকা বিকাশ পার্সোনালে পাঠান।”",
      indicators: { phone: "****7742", domain: null, phrases: ["টাইপিং জব", "ফর্ম ফিলাপ ফি"] },
      status: "under_review",
    },
    {
      id: "RPT-4PL9R7GN",
      days: 5,
      category: "prize_lottery",
      risk: "HIGH_RISK",
      content:
        "“অভিনন্দন! আপনি বাংলাদেশ ব্যাংক ৫০তম বার্ষিকী লটারিতে ১০ লাখ টাকা জিতেছেন। পুরস্কার ক্লেইম করতে প্রসেসিং ফি ২৫০০ টাকা পাঠান।”",
      indicators: { phone: "****9015", domain: null, phrases: ["লটারি", "জিতেছেন", "প্রসেসিং ফি"] },
      status: "pending",
    },
    {
      id: "RPT-6ZB3T8WJ",
      days: 3,
      category: "phishing_link",
      risk: "HIGH_RISK",
      content:
        "“আপনার Nagad ক্যাশব্যাক অপেক্ষা করছে! এখনই ক্লেইম করুন: hxxp://nagad-reward[.]xyz/claim”",
      indicators: { phone: null, domain: "nagad-reward.xyz", phrases: ["ক্যাশব্যাক", "ক্লেইম করুন"] },
      status: "pending",
    },
    {
      id: "RPT-1VQ7D5RS",
      days: 8,
      category: "phishing_link",
      risk: "HIGH_RISK",
      content:
        "“বিটিআরসি থেকে জানানো যাচ্ছে, আপনার সিম রেজিস্ট্রেশন বাতিল হচ্ছে। নম্বর চালু রাখতে এই ফর্মে গিয়ে NID ও পিন দিন: hxxp://sim-btrc-verify[.]top”",
      indicators: { phone: null, domain: "sim-btrc-verify.top", phrases: ["সিম রেজিস্ট্রেশন", "বাতিল"] },
      status: "under_review",
    },
    {
      id: "RPT-0KC2W6YH",
      days: 13,
      category: "loan_scam",
      risk: "HIGH_RISK",
      content:
        "“তাৎক্ষণিক লোন! কোনো জামানত ছাড়া ৫০,০০০ টাকা লোন, ৩ মিনিটে অ্যাপ্রুভাল। শুধু সার্ভিস চার্জ ৫০০ টাকা অ্যাডভান্স দিন।”",
      indicators: { phone: "****5528", domain: null, phrases: ["তাৎক্ষণিক লোন", "অ্যাডভান্স"] },
      status: "pending",
    },
    {
      id: "RPT-7JM4Q3XN",
      days: 6,
      category: "parcel_scam",
      risk: "HIGH_RISK",
      content:
        "“স্বাস্থ্য মন্ত্রণালয় থেকে বিনামূল্যে সানগ্লাস প্যাকেজ এসেছে আপনার নামে। ডেলিভারি চার্জ ২০০ টাকা [মোবাইল ••••৬৬২১] নম্বরে পাঠান।”",
      indicators: { phone: "****6621", domain: null, phrases: ["প্যাকেজ এসেছে", "ডেলিভারি চার্জ"] },
      status: "rejected",
    },
    {
      id: "RPT-3WF8N9BQ",
      days: 16,
      category: "impersonation",
      risk: "HIGH_RISK",
      content:
        "“আমি তোমার মামা বলছি, আমার পুরনো নম্বর হারিয়ে গেছে। এই নতুন নম্বরটা সেভ কর। কাল জরুরি কাজে ৫০ হাজার টাকা লাগবে।”",
      indicators: { phone: "****1240", domain: null, phrases: ["নতুন নম্বর", "সেভ কর", "জরুরি কাজে"] },
      status: "pending",
    },
    {
      id: "RPT-9DG5V1TK",
      days: 10,
      category: "app_control",
      risk: "HIGH_RISK",
      content:
        "“ব্র্যাক ব্যাংক কাস্টমার কেয়ার থেকে বলছি। আপনার অ্যাপ আপডেট করতে হবে। এই লিংকে ক্লিক করে AnyDesk ইনস্টল করুন, আমরা দেখে ঠিক করে দিব।”",
      indicators: { phone: "****3374", domain: "brac-care-help.club", phrases: ["AnyDesk", "ইনস্টল করুন"] },
      status: "under_review",
    },
    {
      id: "RPT-2RH7L6PM",
      days: 12,
      category: "shopping_scam",
      risk: "HIGH_RISK",
      content:
        "“সিলভার গোল্ড প্লাস ইয়ারবাডস মাত্র ৭৯৯ টাকা! মূল্য ৩৫০০। আজই শেষ দিন। অর্ডার কনফার্ম করতে এডভান্স ২০০ টাকা পাঠান।”",
      indicators: { phone: "****6621", domain: null, phrases: ["অর্ডার কনফার্ম", "আজই শেষ দিন", "এডভান্স"] },
      status: "pending",
    },
    {
      id: "RPT-5NB8J4QD",
      days: 18,
      category: "romance_investment",
      risk: "HIGH_RISK",
      content:
        "“বিদেশে থাকা এক বোন বলছি, বিশ্বাস করে বলছি — বিটকয়েন ট্রেডিংয়ে ডাবল প্রফিট হচ্ছে। তুমি শুধু ১০ হাজার ইনভেস্ট করো, কথা দিচ্ছি লাভ হবেই।”",
      indicators: { phone: "****0913", domain: null, phrases: ["ডাবল প্রফিট", "ইনভেস্ট", "কথা দিচ্ছি"] },
      status: "pending",
    },
  ];

  for (const r of reports) {
    const published = r.status === "published";
    await db.report.create({
      data: {
        id: r.id,
        category: r.category,
        riskCategory: r.risk,
        contentRedacted: r.content,
        indicators: r.indicators as unknown as object,
        status: r.status,
        synthetic: true,
        submittedAt: daysAgo(r.days),
        reviewedAt: ["published", "rejected"].includes(r.status) ? daysAgo(Math.max(0, r.days - 1)) : null,
        ...(published
          ? {
              publishedAt: daysAgo(Math.max(0, r.days - 1)),
              title: `সতর্কতা: ${SCAM_CATEGORIES[r.category]?.bn ?? r.category} ধরনের প্রতারণার চেষ্টা রিপোর্ট হয়েছে`,
              alertBody: r.content
                .replace(/(?:https?:\/\/|www\.)\S+/gi, "[লিংক সরানো হয়েছে]")
                .replace(/\[মোবাইল[^\]]*\]/g, "[নম্বর সরানো হয়েছে]")
                .slice(0, 400),
            }
          : {}),
      },
    });
  }
  console.log(`  ${reports.length} synthetic reports (labeled)`);

  // ---- synthetic fraud patterns ----
  const patterns = [
    {
      code: "FP-2025-001",
      name: { bn: "বিকাশ OTP ফিশিং ঢেউ", en: "bKash OTP phishing wave" },
      description: {
        bn: "একই ধরনের বার্তা: নিজেদের বিকাশ কর্তৃপক্ষ বলে দাবি করে ওটিপি/পিন চাওয়া হয়, সাথে অ্যাকাউন্ট সাসপেন্ডের ভয় দেখানো হয়।",
        en: "Messages impersonating bKash authority asking for OTP/PIN with account-suspension threats.",
      },
      category: "otp_phishing",
      status: "published",
      confidence: "high",
      reportIds: ["RPT-7K2M9QXA", "RPT-3XK8L2PB", "RPT-9QW4N7TC"],
      indicators: { phones: ["****4521"], phrases: ["ওটিপি", "সিক্রেট কোড"] },
      firstSeen: daysAgo(9),
      lastSeen: daysAgo(2),
      expiresAt: daysAgo(-90), // 90 days ahead
    },
    {
      code: "FP-2025-002",
      name: { bn: "ভুয়া চাকরি অগ্রিম-ফি ক্যাম্পেইন", en: "Fake job advance-fee campaign" },
      description: {
        bn: "সরকারি দপ্তরের নামে নিয়োগ বিজ্ঞপ্তি দেখিয়ে আবেদনের আগেই রেজিস্ট্রেশন/ফর্ম ফি চাওয়া হয়।",
        en: "Fake government job circulars demanding registration/form fees before application.",
      },
      category: "fake_job",
      status: "published",
      confidence: "high",
      reportIds: ["RPT-5TR8V2LE", "RPT-8HY6C4MF"],
      indicators: { phones: ["****7742"], domains: ["dghs-job.online"], phrases: ["রেজিস্ট্রেশন ফি", "ফর্ম ফিলাপ ফি"] },
      firstSeen: daysAgo(14),
      lastSeen: daysAgo(11),
      expiresAt: daysAgo(-90),
    },
    {
      code: "FP-2025-003",
      name: { bn: "বাংলাদেশ ব্যাংক লটারি প্রতারণা", en: "Bangladesh Bank lottery scam" },
      description: {
        bn: "বাংলাদেশ ব্যাংকের নামে ভুয়া লটারি জেতার খবর দিয়ে প্রসেসিং ফি চাওয়া হয়।",
        en: "Fake Bangladesh Bank lottery winnings used to request processing fees.",
      },
      category: "prize_lottery",
      status: "pending",
      confidence: "moderate",
      reportIds: ["RPT-4PL9R7GN"],
      indicators: { phones: ["****9015"], phrases: ["প্রসেসিং ফি", "লটারি"] },
      firstSeen: daysAgo(5),
      lastSeen: daysAgo(5),
      expiresAt: null,
    },
    {
      code: "FP-2025-004",
      name: { bn: "ব্র্যান্ড-ছদ্মবেশী লিংক ক্যাম্পেইন", en: "Brand-lookalike link campaign" },
      description: {
        bn: "নগদ/বিটিআরসি-এর নামে সাদৃশ্যপূর্ণ ডোমেইনে ক্যাশব্যাক বা ভেরিফিকেশনের লোভ দেখিয়ে লিংক পাঠানো হয়।",
        en: "Lookalike domains for Nagad/BTRC used with cashback or verification bait links.",
      },
      category: "phishing_link",
      status: "pending",
      confidence: "moderate",
      reportIds: ["RPT-6ZB3T8WJ", "RPT-1VQ7D5RS"],
      indicators: { domains: ["nagad-reward.xyz", "sim-btrc-verify.top"], phrases: ["ক্লেইম করুন", "ভেরিফাই"] },
      firstSeen: daysAgo(8),
      lastSeen: daysAgo(3),
      expiresAt: null,
    },
    {
      code: "FP-2025-005",
      name: { bn: "সানগ্লাস পার্সেল প্রতারণা", en: "Sunglasses parcel scam" },
      description: {
        bn: "স্বাস্থ্য মন্ত্রণালয়ের নামে বিনামূল্যের প্যাকেজের কথা বলে ডেলিভারি চার্জ চাওয়া।",
        en: "Free parcel claimed from the Health Ministry, with delivery charges requested.",
      },
      category: "parcel_scam",
      status: "rejected",
      confidence: "low",
      reportIds: ["RPT-7JM4Q3XN"],
      indicators: { phones: ["****6621"], phrases: ["ডেলিভারি চার্জ"] },
      firstSeen: daysAgo(6),
      lastSeen: daysAgo(6),
      expiresAt: null,
    },
  ];

  const patternIdByCode: Record<string, string> = {};
  for (const p of patterns) {
    const created = await db.fraudPattern.create({
      data: {
        code: p.code,
        name: p.name as unknown as object,
        description: p.description as unknown as object,
        category: p.category,
        status: p.status,
        synthetic: true,
        confidence: p.confidence,
        reportIds: p.reportIds as unknown as object,
        indicators: p.indicators as unknown as object,
        firstSeen: p.firstSeen,
        lastSeen: p.lastSeen,
        expiresAt: p.expiresAt,
      },
    });
    patternIdByCode[p.code] = created.id;

    // Pattern edges: report membership + shared indicators
    for (const rid of p.reportIds) {
      await db.patternEdge.create({
        data: {
          patternId: created.id,
          sourceKey: `report:${rid}`,
          targetKey: `pattern:${p.code}`,
          relation: "part_of",
          explanation: {
            bn: `রিপোর্ট ${rid} এই প্যাটার্নের সমর্থক প্রমাণ হিসেবে যুক্ত।`,
            en: `Report ${rid} supports this pattern as evidence.`,
          },
          weight: "strong",
        },
      });
    }
    for (const ph of (p.indicators as { phones?: string[]; domains?: string[] }).phones ?? []) {
      await db.patternEdge.create({
        data: {
          patternId: created.id,
          sourceKey: `indicator:phone:${ph}`,
          targetKey: `pattern:${p.code}`,
          relation: "shares_phone",
          explanation: {
            bn: `একই মোবাইল নম্বরের শেষাংশ (${ph}) একাধিক রিপোর্টে দেখা গেছে — সাদৃশ্য, প্রমাণ নয়।`,
            en: `The same phone tail (${ph}) appears across reports — similarity, not proof.`,
          },
          weight: "moderate",
        },
      });
    }
    for (const d of (p.indicators as { domains?: string[] }).domains ?? []) {
      await db.patternEdge.create({
        data: {
          patternId: created.id,
          sourceKey: `domain:${d}`,
          targetKey: `pattern:${p.code}`,
          relation: "shares_domain",
          explanation: {
            bn: `ডোমেইন ${d} এই প্যাটার্নের সাথে যুক্ত।`,
            en: `Domain ${d} is associated with this pattern.`,
          },
          weight: "strong",
        },
      });
    }
  }
  console.log(`  ${patterns.length} synthetic patterns with edges`);

  // ---- human reviews + audit trail for seeded patterns ----
  const reviews = [
    {
      patternCode: "FP-2025-001",
      action: "approve",
      reason:
        "তিনটি স্বাধীন রিপোর্টে একই কৌশল ও নম্বর-শেষাংশ; প্রমাণ যথেষ্ট। (Three independent reports, same tactic and phone tail.)",
      days: 1,
      expiryDays: 90,
    },
    {
      patternCode: "FP-2025-002",
      action: "approve",
      reason:
        "সরকারি দপ্তরের নামে অগ্রিম ফি — দুটি রিপোর্টে একই নম্বর ও কৌশল। (Advance fee using a ministry's name; same number and tactic across two reports.)",
      days: 2,
      expiryDays: 90,
    },
    {
      patternCode: "FP-2025-005",
      action: "reject",
      reason:
        "একটি মাত্র রিপোর্ট; প্রস্তাবিত সম্পর্ক প্রমাণের জন্য অপর্যাপ্ত। (Single report; the proposed relationship is insufficiently supported.)",
      days: 3,
      expiryDays: null,
    },
  ];

  for (const rv of reviews) {
    const patternId = patternIdByCode[rv.patternCode];
    await db.humanReview.create({
      data: {
        patternId,
        reviewerId: analyst.id,
        action: rv.action,
        reason: rv.reason,
        expiresAt: rv.expiryDays ? daysAgo(-rv.expiryDays) : null,
        createdAt: daysAgo(rv.days),
      },
    });
    await db.auditEvent.create({
      data: {
        actorType: "analyst",
        actorId: analyst.id,
        action: `pattern.${rv.action}`,
        entityType: "FraudPattern",
        entityId: rv.patternCode,
        detail: { reason: rv.reason, synthetic: true } as unknown as object,
        createdAt: daysAgo(rv.days),
      },
    });
  }

  await db.auditEvent.create({
    data: {
      actorType: "system",
      action: "seed.completed",
      entityType: "System",
      entityId: null,
      detail: {
        note: "Synthetic demonstration data loaded. All synthetic rows are labeled synthetic=true.",
      } as unknown as object,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
