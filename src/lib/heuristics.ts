// ---------------------------------------------------------------------------
// Deterministic scam-indicator detectors (Agent Harness Module 3).
// Produces evidence BEFORE the language model runs, so every analysis is
// grounded even if the AI provider is unavailable. Bilingual (BN / Banglish /
// EN) pattern matching. All quotes are expected to be pre-redacted.
// ---------------------------------------------------------------------------

import type { Evidence, RiskCategory, Bilingual } from "./types";

export interface HeuristicResult {
  evidence: Evidence[];
  urlAssessment?: UrlAssessment;
  riskCategory: RiskCategory;
  scamCategory: string;
}

const RX = (parts: string[], flags = "i") => new RegExp(parts.join("|"), flags);

// --- keyword groups ---------------------------------------------------------

const OTP_WORDS = RX([
  "otp", "ওটিপি", "ও\\.টি\\.পি", "one[\\s-]?time", "verification\\s*code",
  "ভেরিফিকেশন\\s*কোড", "ভেরিফিকেশন\\s*কড", "কনফার্মেশন\\s*কোড", "সিক্রেট\\s*কোড",
  "\\bpin\\b", "পিন\\s*নম্বর", "পিন\\s*কোড", "\\bpin\\s*number", "পাসওয়ার্ড", "password",
]);

const REQUEST_VERBS = RX([
  "দিন", "দিয়ে\\s*দিন", "পাঠান", "পাঠিয়ে\\s*দিন", "বলুন", "জানান", "শেয়ার\\s*কর",
  "share", "send", "tell\\s*(?:me|us)", "provide", "confirm\\s*কর", "কনফার্ম\\s*কর", "দাও",
]);

const URGENCY_WORDS = RX([
  "এখনই", "এখুনি", "তাড়াতাড়ি", "অবিলম্বে", "সাথে\\s*সাথে", "সঙ্গে\\s*সঙ্গে", "শেষ\\s*সুযোগ",
  "সাথে\\s*সাথেই", "আর\\s*দেরি\\s*নয়", "urgent", "immediately", "right\\s*now", "asap",
  "মিনিটের\\s*মধ্যে", "ঘণ্টার\\s*মধ্যে", "last\\s*warning", "অবহেলা\\s*করলে", "দেরি\\s*করলে",
  "সাথে\\s*সাথে\\s*না\\s*দিলে", "না\\s*দিলে\\s*(তোমার|আপনার)",
]);

const OFFICIAL_NAMES = RX([
  "bkash", "b-kash", "বিকাশ", "nagad", "নগদ", "rocket", "রকেট", "upay", "উপায়",
  "বাংলাদেশ\\s*ব্যাংক", "bangladesh\\s*bank", "sonali\\s*bank", "সোনালী\\s*ব্যাংক",
  "janata\\s*bank", "জনতা\\s*ব্যাংক", "agrani\\s*bank", "অগ্রণী\\s*ব্যাংক", "rupali",
  "রূপালী\\s*ব্যাংক", "dbbl", "dutch\\s*-?\\s?bangla", "ডাচ্\\s*বাংলা", "ইসলামী\\s*ব্যাংক",
  "city\\s*bank", "সিটি\\s*ব্যাংক", "brac\\s*bank", "ব্র্যাক\\s*ব্যাংক", "পুলিশ", "police",
  "সাইবার\\s*ট্রিব্যুনাল", "cirt", "সিআইআরটি", "গোয়েন্দা", "dbI", "rabi", "rabi\\s*wallet",
  "সরকার", "সরকারি", "govt", "government", "ডাকঘর", "স্বাস্থ্য\\s*অধিদপ্তর", "dghs",
  "বিআরটিসিএ", "btrc", "নির্বাচন\\s*কমিশন", "e-governance", "ই-গভর্নেন্স", "ebdc", "bank\\s*asia",
]);

const THREAT_WORDS = RX([
  "গ্রেপ্তার", "হুকুম\\s*দেওয়া\\s*হবে", "মামলা", "আদালত", "চার্জশিট", "সিম\\s*বন্ধ",
  "নম্বর\\s*বন্ধ", "ওয়ারেন্ট", "গুম", "নাম\\s*কেটে\\s*দেওয়া", "অভিযোগ\\s*দেওয়া\\s*হবে",
  "আটক\\s*করা\\s*হবে", "legal\\s*action", "arrest", "warrant", "case\\s*against",
  "number\\s*will\\s*be\\s*(?:blocked|closed)", "তোমাকে\\s*গ্রেপ্তার", "আপনাকে\\s*গ্রেপ্তার",
]);

const MONEY_WORDS = RX([
  "send\\s*money", "ক্যাশ\\s*আউট", "উত্তোলন", "টাকা\\s*পাঠান", "টাকা\\s*দিন",
  "পার্সোনাল\\s*নম্বরে", "personal\\s*number", "নম্বরে\\s*মোবাইল\\s*রিচার্জ",
  "মোবাইল\\s*রিচার্জ", "পেমেন্ট\\s*কর", "pay\\s*(?:now|us|the)", "টাকা\\s*লাগবে",
  "অ্যাডভান্স", "advance\\s*(?:payment|fee)", "সেন্ড\\s*মানি", "ক্যাশ\\s*আউট\\s*কর",
]);

const PRIZE_WORDS = RX([
  "লটারি", "জিতেছেন", "জিতে\\s*গেছেন", "বিজয়ী", "পুরস্কার", "প্রাইজ", "lottery",
  "you\\s*(?:have\\s*)?won", "prize", "winner", "ক্যাশব্যাক\\s*জিতে", "gift\\s*পেয়েছেন",
  "বোনাস\\s*পেয়েছেন", "কুপন\\s*জিতেছেন", "লাকি\\s*ড্র", "lucky\\s*draw",
]);

const FEE_WORDS = RX([
  "রেজিস্ট্রেশন\\s*ফি", "প্রসেসিং\\s*ফি", "processing\\s*fee", "registration\\s*fee",
  "কমিশন\\s*দিতে\\s*হবে", "ফি\\s*দিতে\\s*হবে", "ফর্ম\\s*ফিলাপ\\s*টাকা", "সার্ভিস\\s*চার্জ\\s*পাঠান",
  "ডেলিভারি\\s*চার্জ", "কুরিয়ার\\s*চার্জ", "unlock\\s*fee", "claim\\s*fee", "টাকা\\s*পাঠালে\\s*পাবেন",
]);

const JOB_WORDS = RX([
  "চাকরি", "চাকুরি", "নিয়োগ\\s*বিজ্ঞপ্তি", "job\\s*offer", "part[\\s-]?time\\s*job",
  "অফিস\\s*সহায়ক", "ডাটা\\s*এন্ট্রি", "data\\s*entry", "টাইপিং\\s*জব", "typing\\s*job",
  "form\\s*filling", "ফর্ম\\s*ফিল", "বেতন\\s*মাসে", "salary", "লাইভ\\s*চাকরি", "ভাইসা\\s*চাকরি",
]);

const REMOTE_WORDS = RX([
  "anydesk", "team\\s*viewer", "teamviewer", "স্ক্রিন\\s*শেয়ার", "screen\\s*share",
  "screen\\s*sharing", "এই\\s*অ্যাপটি\\s*ইনস্টল", "অ্যাপ\\s*ডাউনলোড\\s*করুন", "apk\\s*ডাউনলোড",
  "download\\s*this\\s*app", "install\\s*the\\s*app", "লিংকে\\s*ক্লিক\\s*করে\\s*অ্যাপ",
  "settings\\s*এ\\s*যান", "সেটিংসে\\s*যান", "access\\s*code", "রিমোট",
]);

const NEW_NUMBER_WORDS = RX([
  "নতুন\\s*নম্বর", "এই\\s*নম্বরটি\\s*সেভ", "নম্বরটা\\s*সেভ\\s*কর", "save\\s*this\\s*number",
  "আমার\\s*ফোন\\s*হারিয়ে\\s*গেছে", "পুরনো\\s*নম্বরটি\\s*বন্ধ", "old\\s*number\\s*(?:is\\s*)?(?:lost|closed)",
  "এখন\\s*থেকে\\s*এই\\s*নম্বরে", "আমি\\s*তোমার\\s*(?:ভাই|বোন|মামা|চাচা|বন্ধু)",
  "i\\s*am\\s*your", "আমি\\s*(?:তোমার|আপনার)\\s*(?:ভাই|বোন|মামা|চাচা)",
]);

const INJECTION_WORDS = RX([
  "ignore\\s+(?:all\\s+)?(?:previous|prior|above)\\s+instructions",
  "disregard\\s+(?:all\\s+)?(?:previous|prior)\\s+instructions",
  "system\\s*prompt", "you\\s+are\\s+now", "নতুন\\s+নির্দেশনা", "আগের\\s+নির্দেশনা\\s*উপেক্ষা",
  "forget\\s+(?:everything|your\\s+instructions)", "developer\\s+mode", "jailbreak",
]);

const EMOTION_WORDS = RX([
  "ভালোবাসি", "বিশ্বাস\\s*করুন", "বিশ্বাস\\s*কর", "trust\\s*me", "আপনার\\s*ভালোর\\s*জন্য",
  "আমি\\s*ক্ষতি\\s*করব\\s*না", "কথা\\s*দিচ্ছি", "i\\s*promise", "দোয়া\\s*করবেন", "please\\s*bhai",
  "ভাইয়া\\s*বিশ্বাস\\s*করুন",
]);

const PARCEL_WORDS = RX([
  "পার্সেল", "কুরিয়ার", "শার্টের\\s*প্যাকেট", "courier", "parcel", "ডেলিভারি\\s*ম্যান",
  "প্যাকেজ\\s*এসেছে", "সানগ্লাস", "ঘড়ি\\s*প্যাকেট", "gift\\s*প্যাকেট", "শপিং\\s*করেছেন",
]);

const SHOPPING_WORDS = RX([
  "অর্ডার\\s*কনফার্ম", "অর্ডার\\s*কর", "বুক\\s*করা", "ক্যাশ\\s*অন\\s*ডেলিভারি",
  "cash\\s*on\\s*delivery", "cod", "ডিসকাউন্ট\\s*অফার", "ফেসবুক\\s*পেজ\\s*থেকে",
  "half\\s*price", "অর্ধেক\\s*দামে", "শুধু\\s*আজ", "আজই\\s*শেষ\\s*দিন",
]);

const LOAN_WORDS = RX([
  "লোন", "ঋণ", "loan", "তাৎক্ষণিক\\s*লোন", "instant\\s*loan", "E\\s*মিনিটে\\s*লোন",
  "ক্রেডিট\\s*স্কোর\\s*ছাড়া", "no\\s*credit\\s*check", "লোন\\s*সহজ\\s*শর্তে",
]);

const ROMANCE_WORDS = RX([
  "বিদেশে\\s*আছি", "বিয়ের\\s*প্রস্তাব", "প্রেম\\s*করি", "marry\\s*you", "investment\\s*opportunity",
  "বিটকয়েনে\\s*ইনভেস্ট", "bitcoin", "crypto\\s*profit", "মার্কেটে\\s*লগ\\s*কর", "trading",
  "প্রফিট\\s*ডাবল", "guaranteed\\s*return", "নিশ্চিত\\s*লাভ",
]);

// --- URL reputation ---------------------------------------------------------

const SHORTENERS = [
  "bit.ly", "tinyurl.com", "t.co", "cutt.ly", "is.gd", "rb.gy", "shorturl.at",
  "rebrand.ly", "tiny.cc", "ow.ly", "buff.ly", "goo.gl", "s.id", "linktr.ee/redirect",
];

const BRAND_TOKENS = [
  "bkash", "nagad", "rocket", "dbbl", "bangladeshbank", "police", "btrc", "sonali",
  "janata", "agrani", "rupali", "islamibank", "bracbank", "citybank",
];

const OFFICIAL_DOMAINS = [
  "bkash.com", "nagad.com.bd", "rocketbd.com.bd", "dbbl.com", "bb.org.bd",
  "police.gov.bd", "cirt.gov.bd", "btrc.gov.bd", "sonalibank.com.bd",
];

const CRED_WORDS_IN_PATH = RX([
  "login", "signin", "verify", "verification", "otp", "kyc", "update", "account",
  "password", "confirm", "secure", "auth", "wallet", "unlimited", "gift", "reward", "claim",
]);

const SUSPICIOUS_TLDS = ["xyz", "top", "club", "online", "site", "buzz", "icu", "cfd", "rest", "shop"];

export interface UrlAssessment {
  input: string;
  normalized: string;
  host: string;
  href: string | null;
  properties: Evidence[];
  risk: "high" | "moderate" | "low";
}

export function analyzeUrl(raw: string, keyPrefix = "E"): { assessment: UrlAssessment; nextKey: () => string } {
  let keyN = 1;
  const nextKey = () => `${keyPrefix}${keyN++}`;
  const props: Evidence[] = [];
  const input = raw.trim();

  let url: URL | null = null;
  let normalized = input;
  try {
    normalized = /^[a-z][a-z0-9+.-]*:\/\//i.test(input) ? input : `https://${input}`;
    url = new URL(normalized);
  } catch {
    url = null;
  }

  if (!url) {
    props.push({
      key: nextKey(),
      kind: "url_property",
      quote: input.slice(0, 120),
      interpretation: {
        bn: "এটি একটি বৈধ ওয়েব ঠিকানা নয় — লিঙ্কটি ভাঙা বা ইচ্ছাকৃতভাবে বিকৃত।",
        en: "This is not a valid web address — the link is broken or deliberately obfuscated.",
      },
      tactic: "obfuscation",
      source: "heuristic:url-invalid",
      weight: "moderate",
    });
    return { assessment: { input, normalized, host: "", href: null, properties: props, risk: "moderate" }, nextKey };
  }

  const host = url.hostname.toLowerCase();
  const labels = host.split(".");
  const domain = labels.slice(-2).join(".");
  const subdomain = labels.slice(0, -2).join(".");
  let risk: "high" | "moderate" | "low" = "low";

  // Punycode — almost always brand spoofing
  if (host.includes("xn--")) {
    props.push(mkUrlProp(nextKey(), host, {
      bn: "ঠিকানাটিতে punycode (xn--) আছে — এটি প্রায় সবসময় পরিচিত ব্র্যান্ডের নাম নকল করার কৌশল।",
      en: "The address uses punycode (xn--) — almost always used to imitate a well-known brand.",
    }, "lookalike_domain", "strong"));
    risk = "high";
  }

  // IP host
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    props.push(mkUrlProp(nextKey(), host, {
      bn: "লিংকটি সরাসরি একটি আইপি ঠিকানায় যায় — বৈধ আর্থিক প্রতিষ্ঠান কখনোই এমন ঠিকানা ব্যবহার করে না।",
      en: "The link points directly to a raw IP address — legitimate financial services never do this.",
    }, "ip_host", "strong"));
    risk = "high";
  }

  // Shortener
  if (SHORTENERS.includes(domain)) {
    props.push(mkUrlProp(nextKey(), domain, {
      bn: "এটি একটি লিংক সংক্ষেপকারী (shortener) — চূড়ান্ত গন্তব্য আড়াল করা আছে, তাই আগে দেখে নেওয়া যাচ্ছে না।",
      en: "This is a URL shortener — the true destination is hidden and cannot be pre-inspected safely.",
    }, "shortener", "moderate"));
    if (risk === "low") risk = "moderate";
  }

  // Brand lookalike in subdomain or domain but not the official domain
  const brandHit = BRAND_TOKENS.find((b) => host.replace(/-/g, "").includes(b));
  const isOfficial = OFFICIAL_DOMAINS.includes(domain) || (domain === "com.bd" && OFFICIAL_DOMAINS.includes(labels.slice(-3).join(".")));
  if (brandHit && !isOfficial) {
    props.push(mkUrlProp(nextKey(), host, {
      bn: `ঠিকানাটিতে “${brandHit}” নামটি আছে, কিন্তু এটি ${brandHit} এর অফিসিয়াল ডোমেইন নয় — ব্র্যান্ডের ছদ্মবেশ হতে পারে।`,
      en: `The address contains “${brandHit}” but is not the official ${brandHit} domain — possible brand impersonation.`,
    }, "lookalike_domain", "strong"));
    risk = "high";
  }

  // Credential keywords in path
  const pathWords = CRED_WORDS_IN_PATH.test(`${url.pathname} ${url.search}`);
  if (pathWords) {
    props.push(mkUrlProp(nextKey(), `${url.pathname}${url.search}`.slice(0, 100), {
      bn: "লিংকের পথে লগইন/ভেরিফিকেশন/OTP-এর মতো শব্দ আছে — শংসাপত্র বা কোড চাওয়ার পৃষ্ঠা হতে পারে।",
      en: "The link path contains login/verification/OTP-type words — likely a credential or code harvesting page.",
    }, "credential_path", "moderate"));
    if (risk === "low") risk = "moderate";
  }

  // Suspicious TLD
  const tld = labels[labels.length - 1];
  if (SUSPICIOUS_TLDS.includes(tld)) {
    props.push(mkUrlProp(nextKey(), domain, {
      bn: "অস্বাভাবিক টপ-লেভেল ডোমেইন (.xyz/.top জাতীয়) — স্বল্পমেয়াদি প্রতারণা সাইটে এগুলো বেশি দেখা যায়।",
      en: "Unusual top-level domain (.xyz/.top family) — commonly used by short-lived scam sites.",
    }, "suspicious_tld", "moderate"));
    if (risk === "low") risk = "moderate";
  }

  // http (no TLS)
  if (url.protocol === "http:") {
    props.push(mkUrlProp(nextKey(), url.protocol, {
      bn: "লিংকটি এনক্রিপ্টেড নয় (http) — আর্থিক প্রতিষ্ঠানের সাইট সবসময় https ব্যবহার করে।",
      en: "The link is not encrypted (http) — financial service sites always use https.",
    }, "no_tls", "moderate"));
    if (risk === "low") risk = "moderate";
  }

  // Excessive hyphens
  const hyphens = (host.match(/-/g) || []).length;
  if (hyphens >= 2) {
    props.push(mkUrlProp(nextKey(), host, {
      bn: "ডোমেইনে অনেকগুলো হাইফেন আছে — বৈধ প্রতিষ্ঠানের ঠিকানায় এমনটি বিরল।",
      en: "The domain has many hyphens — rare on legitimate institutional addresses.",
    }, "hyphenated_domain", "weak"));
  }

  return { assessment: { input, normalized, host, href: url.href, properties: props, risk }, nextKey };
}

function mkUrlProp(
  key: string,
  quote: string,
  interpretation: Bilingual,
  tactic: string,
  weight: "strong" | "moderate" | "weak"
): Evidence {
  return {
    key,
    kind: "url_property",
    quote: quote.slice(0, 140),
    interpretation,
    tactic,
    source: `heuristic:url-${tactic}`,
    weight,
  };
}

// --- text detectors -----------------------------------------------------------

interface DetectorDef {
  id: string;
  pattern: RegExp;
  tactic: string;
  weight: "strong" | "moderate" | "weak";
  interpretation: Bilingual;
}

const DETECTORS: DetectorDef[] = [
  {
    id: "otp-request",
    pattern: combineNear(OTP_WORDS, REQUEST_VERBS, 60),
    tactic: "otp_request",
    weight: "strong",
    interpretation: {
      bn: "বার্তায় ওটিপি/পিন/পাসওয়ার্ড চাওয়া হয়েছে — কোনো বৈধ প্রতিষ্ঠান কখনোই এসব চায় না।",
      en: "The message asks for an OTP/PIN/password — no legitimate institution ever asks for these.",
    },
  },
  {
    id: "urgency",
    pattern: URGENCY_WORDS,
    tactic: "urgency",
    weight: "moderate",
    interpretation: {
      bn: "অতিরিক্ত তাড়াহুড়ো বা চাপ তৈরি করা হয়েছে — ভুয়া সনাক্তকরণের সময় না দিয়ে দ্রুত সিদ্ধান্ত নিতে বাধ্য করার কৌশল।",
      en: "Extreme urgency or pressure — a tactic to force a quick decision before you can verify.",
    },
  },
  {
    id: "impersonation",
    pattern: OFFICIAL_NAMES,
    tactic: "impersonation",
    weight: "strong",
    interpretation: {
      bn: "প্রেরক নিজেকে কোনো পরিচিত সরকারি/আর্থিক প্রতিষ্ঠান বলে দাবি করেছে — প্রেরকের আসল পরিচয় এখনো যাচাই হয়নি।",
      en: "The sender claims to represent a well-known government/financial institution — the sender's identity is not verified.",
    },
  },
  {
    id: "authority-threat",
    pattern: THREAT_WORDS,
    tactic: "intimidation",
    weight: "strong",
    interpretation: {
      bn: "গ্রেপ্তার, মামলা বা সেবা বন্ধের হুমকি দেওয়া হয়েছে — ভয় দেখিয়ে বশ করার কৌশল।",
      en: "Threats of arrest, legal cases, or service suspension — an intimidation tactic.",
    },
  },
  {
    id: "money-transfer",
    pattern: MONEY_WORDS,
    tactic: "money_request",
    weight: "strong",
    interpretation: {
      bn: "টাকা পাঠানোর অনুরোধ করা হয়েছে — বিশেষত কারও 'পার্সোনাল নম্বরে' পাঠানোর বার্তা সর্বদা সন্দেহজনক।",
      en: "A money transfer is requested — especially to a 'personal number', which is always suspicious.",
    },
  },
  {
    id: "prize-lottery",
    pattern: PRIZE_WORDS,
    tactic: "false_reward",
    weight: "strong",
    interpretation: {
      bn: "অযাচিত পুরস্কার/লটারি জেতার দাবি — যারা প্রতিযোগিতায় অংশ নেননি, তাদের 'জেতা' প্রায় সবসময়ই প্রতারণা।",
      en: "Unsolicited prize/lottery claims — if you never entered, 'winning' is almost always a scam.",
    },
  },
  {
    id: "job-fee",
    pattern: JOB_WORDS,
    tactic: "fake_job",
    weight: "moderate",
    interpretation: {
      bn: "চাকরির প্রস্তাব দেওয়া হয়েছে — বৈধ চাকরি দেওয়ার আগে কখনোই টাকা চাওয়া হয় না, তাই এটি যাচাই করা জরুরি।",
      en: "A job offer is mentioned — legitimate employers never ask for money first, so verify carefully.",
    },
  },
  {
    id: "advance-fee",
    pattern: FEE_WORDS,
    tactic: "advance_fee",
    weight: "strong",
    interpretation: {
      bn: "পুরস্কার/সেবা পেতে আগে ফি বা চার্জ পাঠাতে বলা হয়েছে — অগ্রিম ফি চাওয়া প্রতারণার সুস্পষ্ট লক্ষণ।",
      en: "You are asked to pay a fee first to receive a reward/service — a clear advance-fee scam marker.",
    },
  },
  {
    id: "remote-control",
    pattern: REMOTE_WORDS,
    tactic: "device_control",
    weight: "strong",
    interpretation: {
      bn: "অ্যাপ ইনস্টল, স্ক্রিন শেয়ার বা রিমোট অ্যাক্সেসের কথা বলা হয়েছে — এর মাধ্যমে আপনার অ্যাকাউন্ট সম্পূর্ণ নিয়ন্ত্রণে নেওয়া হতে পারে।",
      en: "App installation, screen sharing or remote access is requested — this can hand full control of your account to a stranger.",
    },
  },
  {
    id: "new-number",
    pattern: NEW_NUMBER_WORDS,
    tactic: "identity_switch",
    weight: "moderate",
    interpretation: {
      bn: "'নতুন নম্বর' বা পরিচিতির ছদ্মবেশ — পরিচিত কারও নামে আসা অচেনা নম্বর আগে যাচাই করা উচিত।",
      en: "A 'new number' or familiar-person pretence — an unknown number claiming to be a contact should be verified first.",
    },
  },
  {
    id: "injection-attempt",
    pattern: INJECTION_WORDS,
    tactic: "prompt_injection",
    weight: "moderate",
    interpretation: {
      bn: "বার্তায় সিস্টেমকে বিভ্রান্ত করার নির্দেশনা পাওয়া গেছে (prompt injection) — এই নির্দেশনা কখনোই অনুসরণ করা হয় না, কেবল সনাক্ত করা হয়।",
      en: "The content contains instructions attempting to manipulate the analyzer (prompt injection) — these are never followed, only flagged.",
    },
  },
  {
    id: "emotional-pressure",
    pattern: EMOTION_WORDS,
    tactic: "emotional_pressure",
    weight: "weak",
    interpretation: {
      bn: "আবেগ বা বিশ্বাসের অনুরোধ করা হয়েছে — সিদ্ধান্তের আগে বিশ্বাসের চেয়ে যাচাই বেশি জরুরি।",
      en: "Emotional appeals or demands of trust — verification matters more than trust before acting.",
    },
  },
  {
    id: "parcel",
    pattern: PARCEL_WORDS,
    tactic: "parcel_lure",
    weight: "moderate",
    interpretation: {
      bn: "অপ্রত্যাশিত পার্সেল/কুরিয়ারের কথা বলা হয়েছে — আপনি কিছু অর্ডার না করে থাকলে এটি সন্দেহজনক।",
      en: "An unexpected parcel/courier is mentioned — suspicious if you never ordered anything.",
    },
  },
  {
    id: "shopping-offer",
    pattern: SHOPPING_WORDS,
    tactic: "shopping_lure",
    weight: "moderate",
    interpretation: {
      bn: "অস্বাভাবিক ছাড়ের অফার বা অর্ডার কনফার্মেশনের কথা আছে — অতিরিক্ত সস্তা অফার প্রায়ই ভুয়া পেজের ফাঁদ।",
      en: "An unusually cheap offer or order confirmation is mentioned — extreme discounts are often fake-page bait.",
    },
  },
  {
    id: "loan",
    pattern: LOAN_WORDS,
    tactic: "loan_lure",
    weight: "moderate",
    interpretation: {
      bn: "সহজ শর্তে ঋণের প্রস্তাব — অনুমোদিত নয় এমন সব 'লোন' প্রস্তাব যাচাই ছাড়া বিশ্বাস করা বিপজ্জনক।",
      en: "An easy-loan offer — unverified 'instant loan' propositions are dangerous without verification.",
    },
  },
  {
    id: "romance-investment",
    pattern: ROMANCE_WORDS,
    tactic: "romance_investment",
    weight: "moderate",
    interpretation: {
      bn: "ঘনিষ্ঠতা বা বিনিয়োগ-মুনাফার কথা আছে — অপরিচিতের বিনিয়োগ পরামর্শ ও 'নিশ্চিত লাভ' প্রতারণার শাস্ত্রীয় লক্ষণ।",
      en: "Intimacy or investment-profit talk — investment tips from strangers and 'guaranteed returns' are classic scam markers.",
    },
  },
];

/** Build a regex that fires when two patterns occur within `window` chars of each other. */
function combineNear(a: RegExp, b: RegExp, window: number): RegExp {
  const aSrc = a.source;
  const bSrc = b.source;
  return new RegExp(`(?:${aSrc})[\\s\\S]{0,${window}}?(?:${bSrc})|(?:${bSrc})[\\s\\S]{0,${window}}?(?:${aSrc})`, "i");
}

export interface HeuristicResult {
  evidence: Evidence[];
  urlAssessment?: UrlAssessment;
  riskCategory: RiskCategory;
  scamCategory: string;
}

/** Extract quoted context around a match, on a single line when possible. */
function quoteAround(text: string, index: number, len: number): string {
  const start = Math.max(0, index - 40);
  const end = Math.min(text.length, index + len + 40);
  let quote = text.slice(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) quote = "…" + quote;
  if (end < text.length) quote = quote + "…";
  return quote.slice(0, 160);
}

export function detectScamIndicators(redactedText: string, rawUrl?: string): HeuristicResult {
  const evidence: Evidence[] = [];
  let n = 1;
  const nextKey = () => `E${n++}`;

  for (const det of DETECTORS) {
    const m = redactedText.match(det.pattern);
    if (m && m.index !== undefined) {
      evidence.push({
        key: nextKey(),
        kind: det.id === "injection-attempt" ? "context" : "heuristic",
        quote: quoteAround(redactedText, m.index, m[0].length),
        interpretation: det.interpretation,
        tactic: det.tactic,
        source: `heuristic:${det.id}`,
        weight: det.weight,
      });
    }
  }

  let urlAssessment: UrlAssessment | undefined;
  if (rawUrl && rawUrl.trim()) {
    const res = analyzeUrl(rawUrl, "");
    // re-key url props after text evidence
    urlAssessment = res.assessment;
    for (const p of urlAssessment.properties) {
      p.key = nextKey();
      evidence.push(p);
    }
  } else {
    // Also scan for embedded URLs in text
    const urlMatches = redactedText.match(/https?:\/\/[^\s]+|(?:^|\s)www\.[^\s]+/gi) || [];
    for (const u of urlMatches.slice(0, 3)) {
      const res = analyzeUrl(u.trim(), "");
      urlAssessment = urlAssessment ?? res.assessment;
      for (const p of res.assessment.properties) {
        p.key = nextKey();
        evidence.push(p);
      }
    }
  }

  return {
    evidence,
    urlAssessment,
    ...assessRisk(evidence),
  };
}

function has(evidence: Evidence[], tactic: string, sourceId?: string): boolean {
  return evidence.some(
    (e) => e.tactic === tactic && (!sourceId || e.source === `heuristic:${sourceId}`)
  );
}

/** Deterministic risk + category cascade used for rule-based fallback and gate consistency. */
export function assessRisk(evidence: Evidence[]): { riskCategory: RiskCategory; scamCategory: string } {
  const otp = has(evidence, "otp_request");
  const impersonation = has(evidence, "impersonation");
  const threat = has(evidence, "intimidation");
  const money = has(evidence, "money_request");
  const prize = has(evidence, "false_reward");
  const fee = has(evidence, "advance_fee");
  const job = has(evidence, "fake_job");
  const remote = has(evidence, "device_control");
  const lookalike = evidence.some((e) => e.source === "heuristic:url-lookalike_domain" || e.source === "heuristic:url-ip_host" || e.source === "heuristic:url-punycode" || e.source === "heuristic:url-lookalike");
  const linkRisk = evidence.some((e) => e.tactic === "credential_path" || e.tactic === "shortener" || e.tactic === "no_tls" || e.tactic === "suspicious_tld");
  const newNumber = has(evidence, "identity_switch");
  const parcel = has(evidence, "parcel_lure");
  const shopping = has(evidence, "shopping_lure");
  const loan = has(evidence, "loan_lure");
  const romance = has(evidence, "romance_investment");
  const urgency = has(evidence, "urgency");

  if (remote) return { riskCategory: "high", scamCategory: "app_control" };
  if (otp) return { riskCategory: "high", scamCategory: "otp_phishing" };
  if (threat && (impersonation || urgency)) return { riskCategory: "high", scamCategory: "threat_extortion" };
  if (prize && (fee || impersonation)) return { riskCategory: "high", scamCategory: "prize_lottery" };
  if (prize) return { riskCategory: "uncertain", scamCategory: "prize_lottery" };
  if (job && fee) return { riskCategory: "high", scamCategory: "fake_job" };
  if (lookalike) return { riskCategory: "high", scamCategory: "phishing_link" };
  if (money && (impersonation || urgency)) return { riskCategory: "high", scamCategory: "impersonation" };
  if (money && (parcel || fee)) return { riskCategory: "high", scamCategory: "parcel_scam" };
  if (money) return { riskCategory: "uncertain", scamCategory: "uncertain_situation" };
  if (linkRisk) return { riskCategory: "uncertain", scamCategory: "phishing_link" };
  if (shopping && fee) return { riskCategory: "high", scamCategory: "shopping_scam" };
  if (loan && fee) return { riskCategory: "high", scamCategory: "loan_scam" };
  if (romance && (fee || money)) return { riskCategory: "high", scamCategory: "romance_investment" };
  if (impersonation && urgency) return { riskCategory: "uncertain", scamCategory: "impersonation" };
  if (newNumber) return { riskCategory: "uncertain", scamCategory: "impersonation" };
  if (job || loan || parcel || shopping || romance || impersonation || urgency)
    return { riskCategory: "uncertain", scamCategory: "uncertain_situation" };

  return { riskCategory: "none", scamCategory: "no_indicators" };
}
