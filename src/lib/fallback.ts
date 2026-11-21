// ---------------------------------------------------------------------------
// Deterministic rule-based fallback engine.
// Produces a complete, policy-compliant AnalysisResult WITHOUT any AI call.
// Used when the AI provider fails or the Safety Gate rejects the model output
// twice. Always honestly labeled engine = "rule_based".
// ---------------------------------------------------------------------------

import type {
  AnalysisResult,
  Bilingual,
  Evidence,
  Intervention,
  Modality,
  ReplayStage,
} from "./types";
import { SCAM_CATEGORIES } from "./types";
import { REC_TEMPLATES } from "./safety-gate";

const LIMITS: Bilingual[] = [
  {
    bn: "এই বিশ্লেষণ শুধুমাত্র প্রদত্ত তথ্যের ভিত্তিতে তৈরি — প্রেরকের প্রকৃত পরিচয় যাচাই করা যায়নি।",
    en: "This analysis is based only on the submitted content — the sender's real identity could not be verified.",
  },
  {
    bn: "নিরাপত্তার কারণে বাংলাশিল্ড কোনো লিংক স্বয়ংক্রিয়ভাবে খুলে দেখে না; লিংকের গন্তব্য-পৃষ্ঠার অবস্থা অজানা।",
    en: "For safety, BanglaShield never opens links automatically; the state of the destination page is unknown.",
  },
  {
    bn: "কোনো ফলাফলই ভবিষ্যতের নিশ্চয়তা নয় — টাকা বা কোড চাইলে সবসময় স্বাধীনভাবে যাচাই করুন।",
    en: "No result is a guarantee about the future — always verify independently when money or codes are requested.",
  },
];

interface CategoryPlan {
  recIds: string[];
  why: Bilingual;
  replay: "otp" | "threat" | "prize" | "job" | "link" | "money" | "remote" | "shopping" | "mild" | "none";
}

const PLANS: Record<string, CategoryPlan> = {
  otp_phishing: {
    recIds: ["T_STOP_NO_OTP", "T_VERIFY_OFFICIAL", "T_PRESERVE_EVIDENCE", "T_RECOVERY_CENTER"],
    why: {
      bn: "বার্তায় ওটিপি/পিন চাওয়া হয়েছে। ব্যাংক বা এমএফএস প্রতিষ্ঠান কখনোই ফোন/মেসেজে এসব চায় না — কোড দিলে আপনার হয়ে লেনদেন করা হতে পারে।",
      en: "The message requests an OTP/PIN. Banks and MFS providers never ask for these by phone/message — sharing a code could let someone transact as you.",
    },
    replay: "otp",
  },
  impersonation: {
    recIds: ["T_VERIFY_OFFICIAL", "T_DO_NOT_TRANSFER", "T_PRESERVE_EVIDENCE", "T_BLOCK_REPORT"],
    why: {
      bn: "প্রেরক নিজেকে পরিচিত প্রতিষ্ঠান বলে দাবি করেছে, কিন্তু যাচাইযোগ্য কোনো প্রমাণ নেই। প্রতিষ্ঠানের ভান করে টাকা বা তথ্য আদায় করা হয় — এটি প্রচলিত প্রতারণার ধরন।",
      en: "The sender claims to be a known institution without verifiable proof. Posing as institutions to extract money or data is a common fraud pattern.",
    },
    replay: "threat",
  },
  threat_extortion: {
    recIds: ["T_VERIFY_OFFICIAL", "T_TALK_TO_FAMILY", "T_PRESERVE_EVIDENCE", "T_BLOCK_REPORT"],
    why: {
      bn: "গ্রেপ্তার, মামলা বা সেবা বন্ধের হুমকি দিয়ে ভয় দেখানো হয়েছে। আসল কর্তৃপক্ষ হুমকির মাধ্যমে টাকা বা তথ্য চায় না — এটি ভয় দেখিয়ে প্রতারণার কৌশল।",
      en: "You are threatened with arrest, cases, or service suspension. Real authorities never demand money or data through threats — this is intimidation-based fraud.",
    },
    replay: "threat",
  },
  prize_lottery: {
    recIds: ["T_DO_NOT_TRANSFER", "T_VERIFY_OFFICIAL", "T_BLOCK_REPORT"],
    why: {
      bn: "আপনি যে প্রতিযোগিতায় অংশ নেননি সেখানে 'পুরস্কার জিতেছেন' জাতীয় দাবি এবং তার সাথে অগ্রিম ফি চাওয়া হয়েছে। পুরস্কার দিতে আগে টাকা লাগে না — এটি অগ্রিম-ফি প্রতারণার সুস্পষ্ট চিহ্ন।",
      en: "You 'won' a prize in a draw you never entered, and an advance fee is requested. Real prizes never require payment first — a clear advance-fee scam marker.",
    },
    replay: "prize",
  },
  fake_job: {
    recIds: ["T_DO_NOT_TRANSFER", "T_INDEPENDENT_VERIFY", "T_BLOCK_REPORT"],
    why: {
      bn: "চাকরির প্রস্তাবের সাথে নিবন্ধন/প্রসেসিং ফি চাওয়া হয়েছে। বৈধ নিয়োগকর্তা চাকরি দেওয়ার আগে প্রার্থীর কাছ থেকে টাকা চান না।",
      en: "A job offer comes with a registration/processing fee. Legitimate employers never ask candidates for money before hiring.",
    },
    replay: "job",
  },
  phishing_link: {
    recIds: ["T_DO_NOT_CLICK", "T_VERIFY_OFFICIAL", "T_STAY_ALERT"],
    why: {
      bn: "লিংকের ঠিকানায় সন্দেহজনক বৈশিষ্ট্য পাওয়া গেছে (প্রতিষ্ঠানের নামের ছদ্মবেশ, আইপি/শর্টেনার ইত্যাদি)। এমন লিংক লগইন বা ওটিপি চেয়ে তথ্য চুরি করতে পারে।",
      en: "The link address shows suspicious traits (brand lookalike, IP/shortener, etc.). Such pages can steal logins or OTPs.",
    },
    replay: "link",
  },
  loan_scam: {
    recIds: ["T_DO_NOT_TRANSFER", "T_INDEPENDENT_VERIFY", "T_BLOCK_REPORT"],
    why: {
      bn: "সহজ শর্তে ঋণের প্রস্তাব দিয়ে অগ্রিম ফি চাওয়া হয়েছে। অননুমোদিত 'লোন প্রভাইডার' এভাবে ফি নিয়ে হাওয়া হয়ে যায়।",
      en: "An easy-loan offer asks for fees upfront. Unlicensed 'loan providers' often vanish after collecting such fees.",
    },
    replay: "money",
  },
  parcel_scam: {
    recIds: ["T_DO_NOT_TRANSFER", "T_INDEPENDENT_VERIFY", "T_TALK_TO_FAMILY"],
    why: {
      bn: "অপ্রত্যাশিত পার্সেলের কথা বলে ডেলিভারি চার্জ/অগ্রিম টাকা চাওয়া হয়েছে — আপনি অর্ডার না করে থাকলে এটি প্রচলিত পার্সেল প্রতারণা।",
      en: "An unexpected parcel is used to request delivery charges/advance payment — if you never ordered, this is the common parcel scam.",
    },
    replay: "money",
  },
  shopping_scam: {
    recIds: ["T_DO_NOT_TRANSFER", "T_INDEPENDENT_VERIFY", "T_PRESERVE_EVIDENCE"],
    why: {
      bn: "অস্বাভাবিক ছাড়ের অফারের সাথে আগে টাকা পাঠাতে বলা হয়েছে। ভুয়া পেজগুলো অর্ধেক দামের লোভ দেখিয়ে অগ্রিম পেমেন্ট নেয়।",
      en: "An extreme discount is paired with upfront payment. Fake pages use half-price bait to collect advance payments.",
    },
    replay: "shopping",
  },
  app_control: {
    recIds: ["T_NO_APP_INSTALL", "T_VERIFY_OFFICIAL", "T_RECOVERY_CENTER"],
    why: {
      bn: "অ্যাপ ইনস্টল, স্ক্রিন শেয়ার বা রিমোট অ্যাক্সেস চাওয়া হয়েছে। একবার স্ক্রিন দেখালে বা অ্যাপ দিলে আপনার অ্যাকাউন্ট, ওটিপি, ব্যালেন্স সবই প্রতারকের নজরে চলে যায়।",
      en: "App installation, screen sharing, or remote access is requested. Once you share your screen or install the app, your account, OTPs and balance are all exposed.",
    },
    replay: "remote",
  },
  romance_investment: {
    recIds: ["T_DO_NOT_TRANSFER", "T_TALK_TO_FAMILY", "T_INDEPENDENT_VERIFY"],
    why: {
      bn: "ঘনিষ্ঠতা বা বিনিয়োগ-মুনাফার আশ্বাস দিয়ে টাকা চাওয়া হয়েছে। অপরিচিতের 'নিশ্চিত লাভ' প্রস্তাব প্রতারণার শাস্ত্রীয় লক্ষণ।",
      en: "Money is requested with intimacy or profit promises. 'Guaranteed returns' from strangers are a classic scam signature.",
    },
    replay: "money",
  },
  uncertain_situation: {
    recIds: ["T_INDEPENDENT_VERIFY", "T_STAY_ALERT", "T_TALK_TO_FAMILY"],
    why: {
      bn: "কিছু সন্দেহজনক লক্ষণ পাওয়া গেছে, কিন্তু প্রাপ্ত তথ্য থেকে নিশ্চিত সিদ্ধান্তে পৌঁছানো যাচ্ছে না। বড় কিছু করার আগে স্বাধীনভাবে যাচাই করুন।",
      en: "Some suspicious signs were found, but the available information is insufficient for a firm conclusion. Verify independently before doing anything significant.",
    },
    replay: "mild",
  },
  no_indicators: {
    recIds: ["T_STAY_ALERT"],
    why: {
      bn: "প্রদত্ত বার্তায় প্রতারণার স্পষ্ট লক্ষণ ধরা পড়েনি। তবে এটি নিশ্চয়তা নয় — ভবিষ্যতে টাকা বা কোড চাইলে অবশ্যই যাচাই করবেন।",
      en: "No clear scam indicators were detected in the submitted message. This is not a guarantee — always verify future requests for money or codes.",
    },
    replay: "none",
  },
};

function pickReplay(kind: CategoryPlan["replay"], evidence: Evidence[]): Omit<ReplayStage, "id" | "index">[] {
  const ref = (tactic: string) => evidence.find((e) => e.tactic === tactic)?.key;
  const mk = (
    type: ReplayStage["type"],
    title: Bilingual,
    description: Bilingual,
    refs: string[],
    intervention?: Intervention
  ): Omit<ReplayStage, "id" | "index"> => ({
    type,
    title,
    description,
    evidenceRefs: refs.filter(Boolean),
    ...(intervention ? { intervention } : {}),
  });

  switch (kind) {
    case "otp":
      return [
        mk("observed", { bn: "দাবি করা পরিচয়", en: "Claimed identity" },
          { bn: `প্রেরক নিজেকে ব্যাংক/এমএফএস/সরকারি সংস্থার প্রতিনিধি হিসেবে উপস্থাপন করেছে (বার্তায় দেখা গেছে)।`, en: "The sender presented themselves as a bank/MFS/government representative (seen in the message)." },
          [ref("impersonation"), evidence[0]?.key].filter(Boolean) as string[]),
        mk("inferred", { bn: "আস্থা ও চাপ তৈরি", en: "Trust & pressure" },
          { bn: "সরকারি ভান করে বিশ্বাস জমানো হয়েছে, সাথে তাড়াহুড়ো দেখানো হয়েছে যাতে আপনি ভেবে দেখার সময় না পান।", en: "Official pretence builds trust, and urgency stops you from thinking it through." },
          [ref("urgency")].filter(Boolean) as string[]),
        mk("observed", { bn: "সংবেদনশীল তথ্য চাওয়া", en: "Sensitive information request" },
          { bn: "সরাসরি ওটিপি/পিন চাওয়া হয়েছে — প্রকৃত প্রতিষ্ঠান কখনোই এটি চায় না।", en: "An OTP/PIN is directly requested — a real institution never does this." },
          [ref("otp_request")].filter(Boolean) as string[]),
        mk("hypothetical", { bn: "যদি কোডটি দিয়ে দেন", en: "If you share the code" },
          { bn: "প্রতারক আপনার হয়ে লেনদেন করতে পারে — টাকা কাটতে পারে (সম্ভাব্য পরিণতি, ভবিষ্যদ্বাণী নয়)।", en: "The scammer could transact as you — money may be deducted (possible outcome, not a prediction)." },
          [],
          {
            question: { bn: "কোডটি কি আপনি দেবেন, নাকি থেমে যাবেন?", en: "Will you share the code, or stop?" },
            safe: { bn: "থেমে গিয়ে নিজে অ্যাপ/হেল্পলাইনে যাচাই করলে অ্যাকাউন্ট সুরক্ষিত থাকে।", en: "Stopping and verifying via the official app/helpline keeps your account safe." },
            unsafe: { bn: "কোড দিলে আপনার হয়ে লেনদেন হতে পারে (অনুমিত)।", en: "Sharing the code could allow transactions in your name (inferred)." },
          }),
      ];
    case "threat":
      return [
        mk("observed", { bn: "কর্তৃপক্ষের ভান", en: "Authority pretence" },
          { bn: "পুলিশ/ব্যাংক/সরকারি সংস্থার নামে যোগাযোগ করা হয়েছে।", en: "Contact was made in the name of police/bank/government." },
          [ref("impersonation")].filter(Boolean) as string[]),
        mk("observed", { bn: "ভয় দেখানো", en: "Intimidation" },
          { bn: "গ্রেপ্তার, মামলা বা সেবা বন্ধের হুমকি দেওয়া হয়েছে।", en: "Threats of arrest, legal action, or service suspension were made." },
          [ref("intimidation")].filter(Boolean) as string[]),
        mk("inferred", { bn: "তাড়াহুড়োর চাপ", en: "Manufactured urgency" },
          { bn: "ভয়ের সাথে সময়ের চাপ দিয়ে যাচাইয়ের সুযোগ কেড়ে নেওয়া হচ্ছে।", en: "Fear combined with time pressure removes your chance to verify." },
          [ref("urgency")].filter(Boolean) as string[]),
        mk("hypothetical", { bn: "যদি হুমকিতে ভয়ে টাকা/তথ্য দেন", en: "If fear makes you pay/share" },
          { bn: "টাকা বা তথ্য দিলে ক্ষতি হতে পারে এবং নতুন হুমকি আসতে পারে (সম্ভাব্য)।", en: "Paying or sharing data could cause loss and invite further threats (possible)." },
          [],
          {
            question: { bn: "ভয়ে সাড়া দেবেন, নাকি থেমে যাচাই করবেন?", en: "Respond to fear, or stop and verify?" },
            safe: { bn: "নিজে অফিসিয়াল নম্বরে যোগাযোগ করলে ভয়ের ভিত্তি নেই ধরা পড়বে।", en: "Contacting the official number yourself will expose the threat as baseless." },
            unsafe: { bn: "টাকা বা তথ্য দিলে ক্ষতি ও নতুন হুমকির ঝুঁকি (অনুমিত)।", en: "Paying or sharing risks loss and further threats (inferred)." },
          }),
      ];
    case "prize":
      return [
        mk("observed", { bn: "লোভ দেখানো", en: "The bait" },
          { bn: "অংশ না নেওয়া কোনো ড্রতে 'পুরস্কার জেতার' দাবি করা হয়েছে।", en: "You were told you 'won' a draw you never entered." },
          [ref("false_reward")].filter(Boolean) as string[]),
        mk("observed", { bn: "অগ্রিম ফি চাওয়া", en: "Advance fee request" },
          { bn: "পুরস্কার 'ক্লেইম' করতে আগে ফি/কমিশন পাঠাতে বলা হয়েছে।", en: "You are asked to send a fee/commission first to 'claim' the prize." },
          [ref("advance_fee")].filter(Boolean) as string[]),
        mk("inferred", { bn: "চিরাচরিত কৌশল", en: "The classic pattern" },
          { bn: "ছোট ফি নিয়ে হাওয়া হওয়া — পুরস্কার কখনো আসে না।", en: "The small fee vanishes — the prize never arrives." },
          []),
        mk("hypothetical", { bn: "যদি ফি পাঠিয়ে দেন", en: "If you pay the fee" },
          { bn: "ফি চলে যাবে, প্রতারক আরও টাকা চাইতে পারে (সম্ভাব্য)।", en: "The fee is gone, and the scammer may demand more (possible)." },
          [],
          {
            question: { bn: "ফি পাঠাবেন, নাকি উপেক্ষা করবেন?", en: "Pay the fee, or ignore?" },
            safe: { bn: "না পাঠিয়ে ব্লক করলে কোনো ক্ষতিই হয় না।", en: "Not paying and blocking means zero loss." },
            unsafe: { bn: "পাঠালে টাকা ফেরত পাওয়া কঠিন হয় (অনুমিত)।", en: "Sending it makes recovery very difficult (inferred)." },
          }),
      ];
    case "job":
      return [
        mk("observed", { bn: "স্বপ্ন দেখানো", en: "The dream offer" },
          { bn: "সহজ চাকরি/বেতনের লোভ দেখানো হয়েছে।", en: "An easy job/salary is dangled as bait." },
          [ref("fake_job")].filter(Boolean) as string[]),
        mk("observed", { bn: "ফি চাওয়া", en: "Fee requested" },
          { bn: "আবেদন/নিবন্ধনের নামে আগে টাকা চাওয়া হয়েছে।", en: "Money is requested upfront for 'registration'." },
          [ref("advance_fee")].filter(Boolean) as string[]),
        mk("inferred", { bn: "অসঙ্গতি", en: "The contradiction" },
          { bn: "বৈধ নিয়োগকর্তা প্রার্থীর কাছ থেকে টাকা চান না — বিপরীতটিই হলে সেটি ফাঁদ।", en: "Legitimate employers never take money from candidates — the opposite is a trap." },
          []),
        mk("hypothetical", { bn: "যদি ফি দিয়ে দেন", en: "If you pay" },
          { bn: "টাকা যাবে, 'চাকরি' আসবে না; নতুন অজুহাতে আরও চাওয়া হতে পারে (সম্ভাব্য)।", en: "The money goes, the 'job' never comes; more demands may follow (possible)." },
          [],
          {
            question: { bn: "ফি দেবেন, নাকি যাচাই করবেন?", en: "Pay the fee, or verify?" },
            safe: { bn: "না দিয়ে নিজে প্রতিষ্ঠানের অফিসিয়াল খবর/ওয়েবসাইটে খুঁজলে সত্য ধরা পড়বে।", en: "Checking the institution's own website/news exposes the truth." },
            unsafe: { bn: "দিলে টাকা হারানোর সম্ভাবনা (অনুমিত)।", en: "Paying risks losing the money (inferred)." },
          }),
      ];
    case "link":
      return [
        mk("observed", { bn: "লিংক পাঠানো", en: "The link arrives" },
          { bn: "সন্দেহজনক বৈশিষ্ট্যসহ একটি লিংক পাঠানো হয়েছে।", en: "A link with suspicious traits was sent." },
          evidence.filter((e) => e.kind === "url_property").map((e) => e.key)),
        mk("inferred", { bn: "ছদ্মবেশী পৃষ্ঠা", en: "The disguised page" },
          { bn: "লিংকটি পরিচিত প্রতিষ্ঠানের ভান করা লগইন/ভেরিফিকেশন পেজ হতে পারে।", en: "The link may lead to a fake login/verification page imitating a known institution." },
          []),
        mk("hypothetical", { bn: "যদি লিংকে ঢুকে তথ্য দেন", en: "If you enter data on the page" },
          { bn: "আপনার পাসওয়ার্ড/ওটিপি প্রতারকের কাছে যেতে পারে (সম্ভাব্য)।", en: "Your password/OTP could reach the scammer (possible)." },
          [],
          {
            question: { bn: "লিংকে ক্লিক করবেন, নাকি নিজে ঠিকানা লিখবেন?", en: "Click the link, or type the address yourself?" },
            safe: { bn: "নিজে ব্রাউজারে অফিসিয়াল ঠিকানা লিখে ঢুকলে বৈধ পেজেই পৌঁছাবেন।", en: "Typing the official address yourself guarantees the real page." },
            unsafe: { bn: "লিংকে গিয়ে লগইন করলে তথ্য চুরি হতে পারে (অনুমিত)।", en: "Logging in via the link may leak your data (inferred)." },
          }),
      ];
    case "remote":
      return [
        mk("observed", { bn: "নিয়ন্ত্রণের অনুরোধ", en: "The control request" },
          { bn: "অ্যাপ ইনস্টল/স্ক্রিন শেয়ার/রিমোট অ্যাক্সেস চাওয়া হয়েছে।", en: "App install/screen share/remote access was requested." },
          [ref("device_control")].filter(Boolean) as string[]),
        mk("inferred", { bn: "সম্পূর্ণ দৃশ্যমানতা", en: "Total visibility" },
          { bn: "স্ক্রিন শেয়ার করলে ওটিপি, ব্যালেন্স, পাসওয়ার্ড — সবই প্রতারক দেখতে পায়।", en: "Screen sharing exposes your OTPs, balance, and passwords to the scammer." },
          []),
        mk("hypothetical", { bn: "যদি অ্যাক্সেস দিয়ে দেন", en: "If you grant access" },
          { bn: "আপনার হয়ে লেনদেন বা তথ্য পরিবর্তন হতে পারে (সম্ভাব্য)।", en: "Transactions or account changes could occur without you (possible)." },
          [],
          {
            question: { bn: "অ্যাক্সেস দেবেন, নাকি বন্ধ করবেন?", en: "Grant access, or refuse?" },
            safe: { bn: "স্পষ্টভাবে না বলে কল কেটে দিলে ঝুঁকি শেষ।", en: "Saying no and hanging up ends the risk." },
            unsafe: { bn: "অ্যাক্সেস দিলে অ্যাকাউন্ট দুর্বল হয়ে পড়ে (অনুমিত)।", en: "Granting access compromises your account (inferred)." },
          }),
      ];
    case "money":
    case "shopping":
      return [
        mk("observed", { bn: "লোভ বা প্রয়োজনের ছুঁতো", en: "The hook" },
          { bn: "লোভজনক অফার বা জরুরি প্রয়োজনের কথা বলা হয়েছে।", en: "An attractive offer or urgent need is presented." },
          evidence.slice(0, 1).map((e) => e.key)),
        mk("observed", { bn: "আগে টাকা চাওয়া", en: "Money first" },
          { bn: "সেবা/পণ্য পাওয়ার আগেই অগ্রিম টাকা পাঠাতে বলা হয়েছে।", en: "You are asked to send money upfront before receiving anything." },
          [ref("money_request"), ref("advance_fee")].filter(Boolean) as string[]),
        mk("hypothetical", { bn: "যদি টাকা পাঠিয়ে দেন", en: "If you send the money" },
          { bn: "পণ্য/সেবা নাও আসতে পারে, টাকা ফেরত কঠিন (সম্ভাব্য)।", en: "The goods/service may never arrive and recovery is hard (possible)." },
          [],
          {
            question: { bn: "আগে টাকা পাঠাবেন, নাকি যাচাই করবেন?", en: "Send money first, or verify?" },
            safe: { bn: "অর্ডার/প্রস্তাবটি অফিসিয়াল চ্যানেলে যাচাই করলে প্রতারণা ধরা পড়ে।", en: "Verifying the order/offer through official channels exposes the scam." },
            unsafe: { bn: "আগে টাকা দিলে ক্ষতির ঝুঁকি থাকে (অনুমিত)।", en: "Paying first carries the risk of loss (inferred)." },
          }),
      ];
    case "mild":
      return [
        mk("observed", { bn: "বার্তার বিষয়বস্তু", en: "What the message shows" },
          { bn: "বার্তায় কিছু লক্ষণ আছে, তবে সেগুলো একাই নিশ্চিত সিদ্ধান্তের জন্য যথেষ্ট নয়।", en: "The message has some signs, but alone they are not enough for a firm conclusion." },
          evidence.slice(0, 2).map((e) => e.key)),
        mk("inferred", { bn: "কেন সতর্ক থাকা জরুরি", en: "Why caution matters" },
          { bn: "প্রেরকের পরিচয় যাচাই হয়নি — তাই টাকা বা তথ্য দেওয়ার আগে স্বাধীন যাচাই জরুরি।", en: "The sender is unverified — independent verification is essential before paying or sharing data." },
          []),
      ];
    case "none":
    default:
      return [
        mk("observed", { bn: "বার্তার বিষয়বস্তু", en: "What the message shows" },
          { bn: "বার্তায় প্রতারণার পরিচিত লক্ষণগুলো (কোড চাওয়া, অগ্রিম ফি, ছদ্মবেশ, হুমকি) পাওয়া যায়নি।", en: "The message does not contain the known scam markers (code requests, advance fees, impersonation, threats)." },
          evidence.slice(0, 2).map((e) => e.key)),
        mk("inferred", { bn: "এর মানে কী", en: "What this means" },
          { bn: "এটি নিরাপত্তার নিশ্চয়তা নয় — ভবিষ্যতে টাকা বা কোড চাইলে সেটি আলাদাভাবে যাচাই করবেন।", en: "This is not a safety guarantee — future requests for money or codes should be checked separately." },
          []),
      ];
  }
}

export function buildFallbackResult(args: {
  caseId: string;
  modality: Modality;
  riskCategory: "high" | "uncertain" | "none";
  scamCategory: string;
  evidence: Evidence[];
  engine: "rule_based";
  reason: "provider-unavailable" | "gate-rejected" | "deterministic";
}): AnalysisResult {
  const plan = PLANS[args.scamCategory] ?? PLANS.uncertain_situation;
  const recs = plan.recIds
    .map((id) => REC_TEMPLATES[id])
    .filter(Boolean)
    .map((tpl, i) => ({
      id: `R${i + 1}`,
      templateId: tpl.id,
      title: tpl.title,
      detail: tpl.detail,
      priority: tpl.priority,
      evidenceRefs: undefined,
    }));

  const stages = pickReplay(plan.replay, args.evidence).map((s, i) => ({
    ...s,
    id: `S${i + 1}`,
    index: i,
  }));

  const catLabel = SCAM_CATEGORIES[args.scamCategory] ?? SCAM_CATEGORIES.uncertain_situation;

  const summaryMap: Record<string, Bilingual> = {
    high: {
      bn: `আপনার জমা দেওয়া বার্তায় বিপজ্জনক লক্ষণ পাওয়া গেছে — সম্ভবত “${catLabel.bn}” ধরনের প্রতারণা। এখনই কোনো টাকা বা কোড দেবেন না।`,
      en: `Your submitted message shows dangerous indicators — likely a “${catLabel.en}” type scam. Do not send money or codes right now.`,
    },
    uncertain: {
      bn: `বার্তাটি সম্পূর্ণ নিশ্চিতভাবে প্রতারণা বলা যাচ্ছে না, তবে সতর্ক হওয়া দরকার। প্রেরকের পরিচয় যাচাই না হওয়া পর্যন্ত কিছু দেবেন না।`,
      en: `The message cannot be firmly classified as a scam, but caution is needed. Do not share anything until the sender is verified.`,
    },
    none: {
      bn: `বার্তায় প্রতারণার স্পষ্ট লক্ষণ পাওয়া যায়নি। এটি সম্পূর্ণ নিরাপত্তার নিশ্চয়তা নয়।`,
      en: `No clear scam indicators were found. This is not a complete safety guarantee.`,
    },
  };

  return {
    caseId: args.caseId,
    modality: args.modality,
    engine: args.engine,
    generatedAt: new Date().toISOString(),
    riskCategory: args.riskCategory,
    scamCategory: args.scamCategory,
    summary: summaryMap[args.riskCategory],
    why: plan.why,
    evidence: args.evidence,
    unknowns: [
      { bn: "প্রেরকের প্রকৃত পরিচয় ও উদ্দেশ্য যাচাই করা যায়নি।", en: "The sender's real identity and intent could not be verified." },
      ...(args.modality === "link"
        ? [{ bn: "লিংকের গন্তব্য পৃষ্ঠার বাস্তব অবস্থা পরীক্ষা করা হয়নি (নিরাপত্তা নীতি)।", en: "The destination page was not inspected (safety policy)." }]
        : []),
    ],
    recommendations: recs,
    replay: stages,
    limitations: [
      ...LIMITS,
      args.reason === "provider-unavailable"
        ? {
            bn: "এই ফলাফলটি নিয়মভিত্তিক বিশ্লেষণ ইঞ্জিন থেকে এসেছে (এআই সেবা এই মুহূর্তে প্রাপ্য ছিল না)।",
            en: "This result comes from the rule-based engine (the AI service was unavailable at this moment).",
          }
        : args.reason === "gate-rejected"
          ? {
              bn: "এআই-এর উত্তর নিরাপত্তা যাচাইয়ে উত্তীর্ণ হয়নি, তাই নিয়মভিত্তিক নিরাপদ ফলাফল দেখানো হচ্ছে।",
              en: "The AI answer did not pass the Safety Gate, so the safe rule-based result is shown instead.",
            }
          : {
              bn: "এই ফলাফলটি সম্পূর্ণ নিয়মভিত্তিক ইঞ্জিন থেকে তৈরি।",
              en: "This result was produced entirely by the rule-based engine.",
            },
    ],
    policy: {
      validated: true,
      checks: ["schema", "template-whitelist", "evidence-grounding", "forbidden-content", "no-contact-leak"],
    },
    resources: Array.from(
      new Set(recs.flatMap((r) => REC_TEMPLATES[r.templateId]?.resourceKeys ?? []))
    ),
  };
}
