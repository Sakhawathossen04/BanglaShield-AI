// Bilingual ScamAcademy curriculum — 8 interactive lessons.
// Audience: ordinary Bangladeshi citizens (rural, elderly, first-time
// smartphone users). Language is simple, warm, non-technical, and purely
// defensive — never teaches how to run scams.

export interface Bilingual {
  bn: string;
  en: string;
}

export interface QuizOption {
  id: "a" | "b" | "c" | "d";
  text: Bilingual;
}

export interface QuizQuestion {
  id: string;
  scenario: Bilingual;
  options: QuizOption[];
  correct: QuizOption["id"];
  explanation: Bilingual;
}

export interface Lesson {
  id: string;
  title: Bilingual;
  summary: Bilingual;
  icon: string;
  minutes: number;
  keyPoints: Bilingual[];
  questions: QuizQuestion[];
}

export const LESSONS: Lesson[] = [
  {
    id: "mobile-banking-fraud",
    title: { bn: "মোবাইল ব্যাংকিং প্রতারণা", en: "Mobile banking fraud" },
    summary: {
      bn: "বিকাশ-নগদ একাউন্ট নিয়ে যেসব ফাঁদ ছড়িয়ে আছে, সেগুলো চিনুন ও ফাঁকি দিন।",
      en: "Recognize and avoid the traps that target your bKash/Nagad accounts.",
    },
    icon: "Smartphone",
    minutes: 4,
    keyPoints: [
      {
        bn: "একাউন্ট বন্ধ, লিমিট বাড়ানো বা রিফান্ডের নামে কেউ ফোন করলে আগে সন্দেহ করুন।",
        en: "If anyone calls about account closure, limits, or refunds — be suspicious first.",
      },
      {
        bn: "নিজে অ্যাপ খুলে দেখুন — অন্যের বলা তথ্যে বিশ্বাস করবেন না।",
        en: "Open the app yourself — never trust details spoken by a caller.",
      },
      {
        bn: "'পার্সোনাল নম্বরে' টাকা পাঠানোর অনুরোধ সর্বদা সন্দেহজনক।",
        en: "Requests to send money to a 'personal number' are always suspicious.",
      },
    ],
    questions: [
      {
        id: "mbf-1",
        scenario: {
          bn: "আপনার ফোনে কল এলো: “স্যার, আমি বিকাশ থেকে বলছি। আপনার একাউন্টে সন্দেহজনক লেনদেন হয়েছে, একাউন্ট সাসপেন্ড হবে।” প্রথমে আপনি কী করবেন?",
          en: "Your phone rings: “Sir, I am calling from bKash. A suspicious transaction occurred and your account will be suspended.” What do you do first?",
        },
        options: [
          {
            id: "a",
            text: { bn: "ভয় না পেয়ে কথা শুনে নিজে বিকাশ অ্যাপ খুলে হিসাব দেখি", en: "Stay calm, and check the balance myself in the bKash app" },
          },
          {
            id: "b",
            text: { bn: "সঙ্গে সঙ্গে যা বলছে তাই মেনে নিই, একাউন্ট তো বাঁচাতে হবে", en: "Accept whatever they say — the account must be saved" },
          },
          {
            id: "c",
            text: { bn: "লাইনে থেকেই তাকে আমার পিন নম্বরটা বলে দিই", en: "Tell them my PIN while still on the line" },
          },
        ],
        correct: "a",
        explanation: {
          bn: "ঠিক করেছেন! বিকাশ কখনোই ফোন করে একাউন্ট বন্ধের খবর দেয় না। নিজের অ্যাপ খুলে দেখলেই আসল অবস্থা জানা যায় — ভয় পাওয়ার কিছু নেই।",
          en: "Correct! bKash never calls to announce account closure. Opening your own app shows the real status — there is nothing to fear.",
        },
      },
      {
        id: "mbf-2",
        scenario: {
          bn: "কলকারী বললো: “সমস্যা এখনই ঠিক করতে হবে, নাহলে নম্বর বন্ধ। একাউন্ট ঠিক রাখতে আপনার সিক্রেট কোড আর যে ওটিপি আসবে সেটা বলুন।” এখন কী করবেন?",
          en: "The caller says: “It must be fixed right now or the number will be blocked. Tell me your secret code and the OTP you receive.” Now what?",
        },
        options: [
          {
            id: "a",
            text: { bn: "ওটিপি বলে দিই — কারণ ও তো বিকাশের লোক", en: "Share the OTP — they claim to be from bKash" },
          },
          {
            id: "b",
            text: { bn: "কল কেটে দিই; একাউন্ট নিয়ে কিছু জানতে চাইলে নিজে অ্যাপের হেল্প লাইন ব্যবহার করি", en: "Hang up; for account questions I use in-app help myself" },
          },
          {
            id: "c",
            text: { bn: "পিন না বলে শুধু ওটিপিটা বলে দিই — পিন তো গোপনই থাকলো", en: "Refuse the PIN but share just the OTP" },
          },
        ],
        correct: "b",
        explanation: {
          bn: "চমৎকার! ওটিপি আর পিন দুটোই গোপন। কোড দিয়ে দিলে প্রতারক আপনার হয়ে টাকা তুলে নিতে পারে। কল কেটে নিজে অফিসিয়াল চ্যানেলে যাচাই করাই নিরাপদ পথ।",
          en: "Excellent! Both OTP and PIN are secrets. Sharing a code lets the scammer transact as you. Hanging up and verifying via official channels is the safe path.",
        },
      },
      {
        id: "mbf-3",
        scenario: {
          bn: "পরে একটি মেসেজ এলো: “আপনার রিফান্ড ৪,৫০০ টাকা বিকাশ করা হয়েছে, টাকা পেতে [মোবাইল ••••১২৩৪] নম্বরে ২০০ টাকা প্রসেসিং চার্জ পাঠান।” বুঝলেন কী?",
          en: "Later a message arrives: “Your refund of Tk 4,500 has been sent; to receive it, send a Tk 200 processing charge to [mobile ••••1234].” What do you understand?",
        },
        options: [
          {
            id: "a",
            text: { bn: "রিফান্ড পেতে চার্জ লাগে — ২০০ টাকা পাঠিয়ে দিই", en: "Refunds require a charge — send the Tk 200" },
          },
          {
            id: "b",
            text: { bn: "টাকা দিতে টাকা চাওয়া মানেই অগ্রিম-ফি প্রতারণা — উপেক্ষা করি", en: "Money-first-to-get-money is an advance-fee scam — ignore it" },
          },
          {
            id: "c",
            text: { bn: "আগে অর্ধেক (১০০ টাকা) পাঠাই, টাকা এলে বাকিটা দেবো", en: "Send half first, pay the rest after the money arrives" },
          },
        ],
        correct: "b",
        explanation: {
          bn: "বাহবা! প্রকৃত রিফান্ড পেতে কোনো ফি দিতে হয় না। “আগে চার্জ, পরে টাকা” — এটি প্রতারণার সুস্পষ্ট নকশা। অর্ধেক পাঠালেও সেটাই যাবে, রিফান্ড আসবে না।",
          en: "Well done! Real refunds never require a fee. “Fee first, money later” is the classic scam pattern. Even half the fee is simply lost.",
        },
      },
    ],
  },
  {
    id: "otp-pin-protection",
    title: { bn: "ওটিপি ও পিন সুরক্ষা", en: "OTP and PIN protection" },
    summary: {
      bn: "ওটিপি-পিন মানেই আপনার টাকার চাবি — কীভাবে সেটি সবার থেকে গোপন রাখবেন।",
      en: "Your OTP/PIN is the key to your money — learn to keep it secret from everyone.",
    },
    icon: "KeyRound",
    minutes: 3,
    keyPoints: [
      { bn: "ওটিপি মানেই গোপন — মা-বাবা, স্বামী-স্ত্রী ছাড়াও কাউকে নয়, এমনকি 'ব্যাংকের লোক'কেও নয়।", en: "An OTP is always secret — not even 'bank staff' may ask for it." },
      { bn: "ওটিপি শুধু নিজের অ্যাপে লিখুন, কাউকে পড়ে শোনাবেন না।", en: "Type the OTP only into your own app; never read it out to anyone." },
      { bn: "একই কোড বারবার চাইলে সেটি প্রতারকের চেষ্টা — নম্বর ব্লক করুন।", en: "Repeated code requests mean a scammer is trying — block the number." },
    ],
    questions: [
      {
        id: "otp-1",
        scenario: {
          bn: "“গোয়েন্দা দপ্তর” থেকে ফোন: “আপনার নামে সিম দিয়ে অপরাধ হয়েছে। আপনি নির্দোষ প্রমাণ করতে এসএমএসে যে কোড আসছে সেটা বলুন।” কোডটা কি বলবেন?",
          en: "A call from the 'detective department': “A crime was committed using a SIM in your name. To prove you are innocent, tell us the code coming to your phone by SMS.” Do you share the code?",
        },
        options: [
          {
            id: "a",
            text: { bn: "হ্যাঁ, নির্দোষ তো প্রমাণ করতেই হবে", en: "Yes, I must prove my innocence" },
          },
          {
            id: "b",
            text: { bn: "না — আসল কর্তৃপক্ষ কখনো এসএমএস কোড চায় না; কল কেটে ৯৯৯-এ খোঁজ নিই", en: "No — real authorities never ask for SMS codes; I hang up and check with 999" },
          },
          {
            id: "c",
            text: { bn: "কোডের শেষ দুই সংখ্যাটুকু বলে দিই", en: "Share just the last two digits" },
          },
        ],
        correct: "b",
        explanation: {
          bn: "অসাধারণ সিদ্ধান্ত! পুলিশ-গোয়েন্দারা কোনো কোড চায় না — এটি ভয় দেখিয়ে কোড আদায়ের কৌশল। শেষ দুই সংখ্যাও দিতে নেই; দুশ্চিন্তা হলে ৯৯৯-এ নিজে কল করুন।",
          en: "Great decision! Police and investigators never ask for codes — this is fear-based code harvesting. Not even partial codes are safe; when worried, call 999 yourself.",
        },
      },
      {
        id: "otp-2",
        scenario: {
          bn: "অনলাইনে কেনাকাটা করতে গিয়ে একটি সাইটে পিন লিখতে বলা হলো: “বিকাশ পিন দিন, পেমেন্ট হয়ে যাবে।” এখানে সমস্যাটা কোথায়?",
          en: "While shopping online, a site asks you to enter your PIN: 'Enter your bKash PIN to complete payment.' What is wrong here?",
        },
        options: [
          {
            id: "a",
            text: { bn: "সমস্যা নেই, পিন দিলেই টাকা কাটবে", en: "Nothing wrong — entering the PIN just pays the bill" },
          },
          {
            id: "b",
            text: { bn: "বিকাশের বৈধ পেমেন্ট পেজে পিন লাগে, কিন্তু অজানা সাইটে পিন লিখলে সেটি চুরি হতে পারে — অ্যাপ দিয়ে পেমেন্ট করি", en: "The PIN belongs only on bKash's own pages; on an unknown site it can be stolen — I pay via the app instead" },
          },
          {
            id: "c",
            text: { bn: "ছোট কেনাকাটায় পিন দিলে ক্ষতি নেই", en: "For small purchases, sharing the PIN is harmless" },
          },
        ],
        correct: "b",
        explanation: {
          bn: "ঠিক ধরেছেন! পিন শুধু বিকাশের নিজের অ্যাপ/পেজে লিখতে হয়। অন্য কোনো সাইটে পিন লিখলে সেটি প্রতারকের হাতে চলে যায় — টাকার পরিমাণ ছোট-বড় ব্যাপার নয়।",
          en: "Exactly right! A PIN is only ever typed into bKash's own app or page. Any other site capturing it hands it to scammers — the amount does not matter.",
        },
      },
      {
        id: "otp-3",
        scenario: {
          bn: "একই নম্বর থেকে টানা তিনবার কোড চাওয়া হলো, আপনি প্রতিবার না বলে দিলেন। পরের ধাপে কী করা উচিত?",
          en: "The same number asked for a code three times; each time you refused. What is the next best step?",
        },
        options: [
          {
            id: "a",
            text: { bn: "নম্বরটি ব্লক করে রিপোর্ট করি, আর কাছের কাউকে জানিয়ে রাখি", en: "Block and report the number, and tell someone close" },
          },
          {
            id: "b",
            text: { bn: "বিরক্ত হয়ে চতুর্থবার কোডটা দিয়ে দিই", en: "Get annoyed and give the code the fourth time" },
          },
          {
            id: "c",
            text: { bn: "কিছুই করি না, ওরা একসময় থেমে যাবে", en: "Do nothing — they will stop eventually" },
          },
        ],
        correct: "a",
        explanation: {
          bn: "বুদ্ধিমানের মতো কাজ! বারবার কোড চাওয়া মানে প্রতারক জেদ ধরেছে। ব্লক + রিপোর্ট করলে ওদের পথ বন্ধ হয়, আর পরিবারকে জানালে সবাই সতর্ক থাকে।",
          en: "Smart move! Repeated code requests mean a determined scammer. Blocking and reporting closes their path, and informing family keeps everyone alert.",
        },
      },
    ],
  },
  {
    id: "fake-job-offers",
    title: { bn: "ভুয়া চাকরির ফাঁদ", en: "Fake job offers" },
    summary: {
      bn: "চাকরির লোভ দেখিয়ে যেভাবে টাকা আদায় করা হয়, সেই ফাঁদ চিনুন।",
      en: "Learn to recognize the traps that use job offers to extract money.",
    },
    icon: "Briefcase",
    minutes: 4,
    keyPoints: [
      { bn: "বৈধ নিয়োগকর্তা চাকরি দেওয়ার আগে কখনোই প্রার্থীর কাছ থেকে টাকা চান না।", en: "Legitimate employers never ask candidates for money before hiring." },
      { bn: "'বেতন ভালো, কাজ সহজ' — এমন সব প্রস্তাব যাচাই ছাড়া বিশ্বাস করবেন না।", en: "'Good salary, easy work' offers deserve verification before belief." },
      { bn: "নিয়োগ বিজ্ঞপ্তি প্রতিষ্ঠানের অফিসিয়াল ওয়েবসাইট/খবরে আছে কি না দেখুন।", en: "Check whether the circular exists on the institution's official website or news." },
    ],
    questions: [
      {
        id: "job-1",
        scenario: {
          bn: "ফেসবুক মেসেঞ্জারে এলো: “সরকারি হাসপাতালে ডাটা এন্ট্রির চাকরি, বেতন ২৫,০০০ টাকা। শুধু সিট কনফার্ম করতে ৩০০ টাকা রেজিস্ট্রেশন ফি পাঠান।” আপনার প্রথম প্রতিক্রিয়া?",
          en: "A Facebook message: “Government hospital data-entry job, salary Tk 25,000. Just send Tk 300 registration fee to confirm your seat.” Your first reaction?",
        },
        options: [
          {
            id: "a",
            text: { bn: "সরকারি চাকরি! ৩০০ টাকা তো সস্তাই — পাঠিয়ে দিই", en: "A government job! Tk 300 is cheap — send it" },
          },
          {
            id: "b",
            text: { bn: "আসল সরকারি নিয়োগ বিজ্ঞপ্তি অফিসিয়াল ওয়েবসাইট/খবরে দেখা যায় — প্রথমে সেখানে খুঁজি", en: "Real government circulars appear on official websites/news — I check there first" },
          },
          {
            id: "c",
            text: { bn: "আগে ১৫০ টাকা পাঠাই, চাকরি পেলে বাকিটা দেবো", en: "Send Tk 150 now, pay the rest if I get the job" },
          },
        ],
        correct: "b",
        explanation: {
          bn: "সঠিক পথ! সরকারি নিয়োগ বিজ্ঞপ্তি সংশ্লিষ্ট দপ্তরের ওয়েবসাইট বা খবরের কাগজে ছাপা হয়, মেসেঞ্জারে আসে না। আর চাকরির আগে ফি চাওয়া প্রায় সবসময়ই প্রতারণা।",
          en: "Right path! Government circulars are published on departmental websites or in newspapers — not via Messenger. And fees-before-the-job are almost always fraud.",
        },
      },
      {
        id: "job-2",
        scenario: {
          bn: "টাকা না পাঠিয়ে আপনি জিজ্ঞেস করলেন: “আপনাদের অফিসের ঠিকানা?” উত্তর এলো: “ঠিকানা দেওয়া যাবে না, কাজ ঘরে বসেই হবে।” এই উত্তর কী বোঝায়?",
          en: "Instead of paying, you ask: “What is your office address?” The reply: “The address cannot be shared; the work is from home.” What does this answer signal?",
        },
        options: [
          {
            id: "a",
            text: { bn: "ঘরে বসে কাজের সুবিধা — ভালোই তো", en: "Work-from-home is a convenience — good" },
          },
          {
            id: "b",
            text: { bn: "যাচাইযোগ্য ঠিকানা না দেওয়া একটি বড় লাল সংকেত — সম্পর্ক শেষ করি", en: "Refusing a verifiable address is a major red flag — I end the contact" },
          },
          {
            id: "c",
            text: { bn: "চাকরির জন্য ঠিকানা জরুরি নয়", en: "An address is not essential for a job" },
          },
        ],
        correct: "b",
        explanation: {
          bn: "বুঝেছেন ঠিক! যে নিয়োগকর্তা নিজের পরিচয় গোপন রাখে, তার চাকরির প্রস্তাবও সন্দেহজনক। বৈধ প্রতিষ্ঠান ঠিকানা-যোগাযোগ খুশি মনে দেয়।",
          en: "Well spotted! An employer hiding their identity makes the offer suspect. Legitimate organizations happily share addresses and contacts.",
        },
      },
      {
        id: "job-3",
        scenario: {
          bn: "পরদিন ওই 'কোম্পানি' থেকে আরও বড় লোভ: “আপনাকে সুপারভাইজার বানানো হলো! প্রশিক্ষণ কিটের জন্য ২,০০০ টাকা লাগবে।” আপনি কী করবেন?",
          en: "The next day the same 'company' offers a bigger lure: “You are promoted to supervisor! The training kit costs Tk 2,000.” What do you do?",
        },
        options: [
          {
            id: "a",
            text: { bn: "প্রমোশন পেয়েছি! ২,০০০ টাকা পাঠিয়ে দিই", en: "A promotion! I send the Tk 2,000" },
          },
          {
            id: "b",
            text: { bn: "ক্রমবর্ধমান টাকার দাবি মানেই ফাঁদ গভীর হচ্ছে — না পাঠিয়ে নম্বর ব্লক করি ও অভিযোগ করি", en: "Escalating demands mean a deepening trap — I refuse, block, and report" },
          },
          {
            id: "c",
            text: { bn: "বন্ধুর কাছ থেকে ধার করে হলেও টাকাটা পাঠাই", en: "Borrow from a friend and send it anyway" },
          },
        ],
        correct: "b",
        explanation: {
          bn: "সম্ভবত জীবন বাঁচিয়েছেন! ছোট ফির পর বড় ফি — এভাবেই প্রতারণা ধাপে ধাপে বাড়ে। এখানে থামাই সবচেয়ে সস্তা সমাধান। ব্লক করুন, দরকার হলে ৯৯৯-এ জানান।",
          en: "You likely just saved your money! Small fee today, bigger fee tomorrow — that is how scams escalate. Stopping here is the cheapest exit. Block, and if needed inform 999.",
        },
      },
    ],
  },
  {
    id: "phishing-links",
    title: { bn: "ফিশিং লিংক চেনা", en: "Recognizing phishing links" },
    summary: {
      bn: "নকল ঠিকানা চিনে নিন — ক্লিকের আগে এক সেকেন্ড দেরি কীভাবে বড় ক্ষতি আটকায়।",
      en: "Learn to spot fake addresses — how a one-second pause before clicking prevents big losses.",
    },
    icon: "Link2",
    minutes: 5,
    keyPoints: [
      { bn: "লিংকের আসল ঠিকানা দেখুন: bkash.com আর bkash-verify.xyz এক নয়।", en: "Read the real address: bkash.com and bkash-verify.xyz are not the same." },
      { bn: "লগইন/ওটিপি/ভেরিফাই শব্দওয়ালা অচেনা লিংকে ক্লিক করবেন না।", en: "Never click unknown links containing login/OTP/verify wording." },
      { bn: "নিজে ঠিকানা লিখে ঢুকুন — বার্তার লিংকে নয়।", en: "Type the address yourself — do not use links from messages." },
    ],
    questions: [
      {
        id: "phish-1",
        scenario: {
          bn: "এসএমএসে এলো: “Dear customer, your bKash account will be blocked. Verify now: hxxp://bkash-verify[.]xyz/login” — এই ঠিকানাটি কীভাবে পড়বেন?",
          en: "An SMS says: “Dear customer, your bKash account will be blocked. Verify now: hxxp://bkash-verify[.]xyz/login” — How do you read this address?",
        },
        options: [
          {
            id: "a",
            text: { bn: "bkash নামটা তো আছেই — নিরাপদ লিংক", en: "The name bkash is there — it must be safe" },
          },
          {
            id: "b",
            text: { bn: "আসল ঠিকানা হলো bkash.com; bkash-verify.xyz একটি নকল ডোমেইন — ক্লিক করবো না", en: "The real address is bkash.com; bkash-verify.xyz is a fake domain — I will not click" },
          },
          {
            id: "c",
            text: { bn: "ব্রাউজার খুললেই তো নিরাপত্তা বোঝা যাবে", en: "Opening it in the browser will show whether it is safe" },
          },
        ],
        correct: "b",
        explanation: {
          bn: "সঠিক পড়েছেন! ডোমেইনের শেষ অংশই আসল পরিচয় — এখানে সেটি xyz, bkash.com নয়। ব্র্যান্ডের নাম বসিয়ে দেওয়া নকল লিংকের প্রথম লক্ষণ।",
          en: "Correct reading! The domain ending is the real identity — here it is .xyz, not bkash.com. Brand names planted inside links are the first sign of a fake.",
        },
      },
      {
        id: "phish-2",
        scenario: {
          bn: "লিংকে ক্লিক না করে আপনি নিজেই ব্রাউজারে bkash.com লিখে ঢুকলেন। অ্যাপের ভেতরে কোনো 'ভেরিফিকেশন রিকোয়েস্ট' নেই। এর মানে কী?",
          en: "Instead of clicking, you typed bkash.com yourself. Inside the app there is no 'verification request'. What does this mean?",
        },
        options: [
          {
            id: "a",
            text: { bn: "এসএমএসটি ভুয়া ছিল — অ্যাপে সত্য দেখা গেল, লিংকটি ছিল ফাঁদ", en: "The SMS was fake — the app showed the truth; the link was a trap" },
          },
          {
            id: "b",
            text: { bn: "অ্যাপ আপডেট হয়নি বোধহয় — লিংকেই আবার যাই", en: "My app may be outdated — I'll use the link after all" },
          },
          {
            id: "c",
            text: { bn: "দুটোই ঠিক, যেটা সুবিধা সেটাই করি", en: "Both are fine — whichever is convenient" },
          },
        ],
        correct: "a",
        explanation: {
          bn: "হুবাহু ঠিক! নিজে ঢুকে দেখা যাচাইয়ের সোনার নিয়ম। অফিসিয়াল অ্যাপে কিছু নেই মানে বার্তার দাবি মিথ্যা। এই এক অভ্যাস বিপুল ক্ষতি আটকায়।",
          en: "Perfectly right! Checking inside yourself is the golden rule of verification. Nothing in the official app means the message's claim is a lie. This one habit stops enormous losses.",
        },
      },
      {
        id: "phish-3",
        scenario: {
          bn: "বন্ধুর নামে মেসেজ এলো: “এই লিংকে ক্লিক করে দেখো, তোমার নামে ক্যাশব্যাক দেখাচ্ছে!” সাথে একটি ছোট (shortened) লিংক: bit[.]ly/xyz123। কী করবেন?",
          en: "A message from a friend's name: “Click this, it shows a cashback in your name!” with a shortened link: bit[.]ly/xyz123. What do you do?",
        },
        options: [
          {
            id: "a",
            text: { bn: "বন্ধুর নামে এসেছে — নিরাপদ, ক্লিক করি", en: "It came from a friend — safe to click" },
          },
          {
            id: "b",
            text: { bn: "বন্ধুর আসল নম্বরে ফোন করে জিজ্ঞেস করি সে পাঠিয়েছে কি না; না পাঠালে লিংক খুলি না ও তাকে অ্যাকাউন্ট সুরক্ষিত করতে বলি", en: "I call my friend's real number to ask whether they sent it; if not, I don't open it and warn them their account may be compromised" },
          },
          {
            id: "c",
            text: { bn: "ক্যাশব্যাক তো ফ্রি টাকাই — দেরি না করে ক্লিক করি", en: "Free money — I click immediately" },
          },
        ],
        correct: "b",
        explanation: {
          bn: "বন্ধুত্বপূর্ণ বুদ্ধিমত্তা! বন্ধুর একাউন্ট হ্যাক হলে তার নামেই ভুয়া লিংক আসে। ফোন করে নিশ্চিত হওয়া আর তাকে সতর্ক করা — দুই কাজই করা উচিত।",
          en: "Friendly brilliance! When a friend's account is hacked, fake links arrive in their name. Confirming by call and warning them protects you both.",
        },
      },
    ],
  },
  {
    id: "fake-government-messages",
    title: { bn: "ভুয়া সরকারি বার্তা", en: "Fake government messages" },
    summary: {
      bn: "সরকারি সংস্থার ছদ্মবেশে আসা বার্তা ও হুমকি — কীভাবে ফাঁকি দেবেন।",
      en: "Messages and threats wearing government costumes — and how to dodge them.",
    },
    icon: "Landmark",
    minutes: 4,
    keyPoints: [
      { bn: "বাংলাদেশ ব্যাংক/বিটিআরসি/পুলিশ টাকা বা কোড চেয়ে এসএমএস পাঠায় না।", en: "Bangladesh Bank/BTRC/Police never send SMS asking for money or codes." },
      { bn: "'লটারিতে জিতেছেন' — সরকারি নামে লটারির দাবি সবসময়ই মিথ্যা।", en: "'You won a lottery' under a government name is always false." },
      { bn: "গ্রেপ্তার/মামলার হুমকি এলে ৯৯৯-এ নিজে কল করে খোঁজ নিন।", en: "If threatened with arrest/cases, call 999 yourself to check." },
    ],
    questions: [
      {
        id: "gov-1",
        scenario: {
          bn: "এসএমএস: “অভিনন্দন! আপনি বাংলাদেশ ব্যাংকের ৫০তম বার্ষিকী লটারিতে ১০,০০,০০০ টাকা জিতেছেন। ক্লেইম করতে প্রসেসিং ফি ২,৫০০ টাকা পাঠান।” আপনি কী করবেন?",
          en: "SMS: “Congratulations! You won Tk 10,00,000 in Bangladesh Bank's 50th anniversary lottery. To claim, send a processing fee of Tk 2,500.” What do you do?",
        },
        options: [
          {
            id: "a",
            text: { bn: "সরকারি লটারি — ফি দিয়ে পুরস্কার নিই", en: "A government lottery — pay the fee and take the prize" },
          },
          {
            id: "b",
            text: { bn: "আমি কোনো লটারিতে অংশই নিইনি; সরকারি নামে এমন দাবি ভিত্তিহীন — মুছে দিই", en: "I never entered a lottery; such claims in government names are baseless — delete it" },
          },
          {
            id: "c",
            text: { bn: "ফি ২,৫০০ টাকাই তো — ঝুঁকি নিয়েই পাঠাই", en: "The fee is only Tk 2,500 — take the chance" },
          },
        ],
        correct: "b",
        explanation: {
          bn: "একদম ঠিক! বাংলাদেশ ব্যাংক কোনো লটারি করে না, আর যে প্রতিযোগিতায় অংশ নেইনি সেখানে 'জেতা' অসম্ভব। পুরস্কার দিতে আগে টাকা লাগে না — কখনোই না।",
          en: "Absolutely right! Bangladesh Bank runs no lottery, and winning a draw you never entered is impossible. Real prizes never require payment first — ever.",
        },
      },
      {
        id: "gov-2",
        scenario: {
          bn: "কল: “বিটিআরসি থেকে বলছি। আপনার সিম রেজিস্ট্রেশনে ভুল তথ্য, নম্বর বন্ধ হবে। ঠিক করতে এই লিংকে NID ও পিন দিন।” কী করবেন?",
          en: "A call: “This is BTRC. Your SIM registration has wrong information; the number will be blocked. To fix it, submit your NID and PIN at this link.” What do you do?",
        },
        options: [
          {
            id: "a",
            text: { bn: "নম্বর তো দরকারি — লিংকে NID-পিন দিয়ে দিই", en: "I need my number — I submit my NID and PIN on the link" },
          },
          {
            id: "b",
            text: { bn: "অপারেটরের সার্ভিস সেন্টারে নিজে গিয়ে বা অফিসিয়াল অ্যাপে সিম-সমস্যা যাচাই করি", en: "I verify SIM issues myself at my operator's service center or official app" },
          },
          {
            id: "c",
            text: { bn: "শুধু NID দিই, পিনটা দিই না", en: "I share only the NID, not the PIN" },
          },
        ],
        correct: "b",
        explanation: {
          bn: "সার্থক সিদ্ধান্ত! সিম-রেজিস্ট্রেশনের আসল খোঁজ অপারেটরের নিজের সেন্টার/অ্যাপে মেলে। কারও পাঠানো লিংকে NID-পিন দিলে পরিচয় চুরির ঝুঁকি বিশাল।",
          en: "Sound decision! Real SIM-registration issues are resolved at your operator's own centers or apps. Submitting NID/PIN on a stranger's link invites identity theft.",
        },
      },
      {
        id: "gov-3",
        scenario: {
          bn: "এক 'পুলিশ অফিসার' ফোনে বললো: “আপনার ছেলের নামে মামলা হয়েছে, গ্রেপ্তার এড়াতে আজই ৫০ হাজার টাকা পাঠান।” প্রতিক্রিয়া?",
          en: "A 'police officer' calls: “A case has been filed against your son; send Tk 50,000 today to avoid arrest.” Your reaction?",
        },
        options: [
          {
            id: "a",
            text: { bn: "অফিসার বলছেন — টাকা পাঠিয়ে দিই", en: "An officer is asking — I send the money" },
          },
          {
            id: "b",
            text: { bn: "ছেলেকে সরাসরি ফোন করি এবং ৯৯৯-এ জানিয়ে সত্যতা যাচাই করি; টাকা পাঠাই না", en: "I call my son directly and verify through 999; I do not send money" },
          },
          {
            id: "c",
            text: { bn: "আধা টাকা এখন, বাকিটা পরে পাঠাই", en: "I send half now, the rest later" },
          },
        ],
        correct: "b",
        explanation: {
          bn: "শান্ত মাথায় সঠিক পথ! আসল আইনশৃঙ্খলা রক্ষক ফোনে টাকা চান না। প্রিয় মানুষের নামে ভয় দেখিয়ে টাকা আদায় এক প্রচলিত কৌশল — সরাসরি যোগাযোগই এর প্রতিষেধক।",
          en: "Calm and correct! Real law enforcement never demands money by phone. Fear-mongering in a loved one's name is a standard tactic — direct contact is the antidote.",
        },
      },
    ],
  },
  {
    id: "impersonation",
    title: { bn: "ছদ্মবেশী পরিচিতি", en: "Impersonation" },
    summary: {
      bn: "'আমি তোমার মামা' — পরিচিতের ছদ্মবেশে আসা অচেনা নম্বর থেকে নিজেকে বাঁচান।",
      en: "'It's your uncle' — protect yourself from unknown numbers wearing familiar faces.",
    },
    icon: "UserCheck",
    minutes: 4,
    keyPoints: [
      { bn: "'নতুন নম্বর থেকে যোগাযোগ' দাবি করা পরিচিতকে পুরনো নম্বরে ফোন করে যাচাই করুন।", en: "Verify 'new number' claims by calling the person's old number." },
      { bn: "আবেগ দিয়ে তাড়াহুড়ো চাপালে আরও সাবধান হোন — এটিই কৌশলের অংশ।", en: "Emotional urgency calls for extra caution — it is part of the tactic." },
      { bn: "ব্যাংক ম্যানেজার সাহেবও ব্যক্তিগত নম্বর থেকে কথা বলেন না।", en: "Even bank managers do not call from personal numbers." },
    ],
    questions: [
      {
        id: "imp-1",
        scenario: {
          bn: "অচেনা নম্বর থেকে: “আমি তোমার মামা! পুরনো নম্বর হারিয়ে গেছে, এইটা সেভ কর। কাল সকালেই ৫০ হাজার টাকা লাগবে জরুরি অপারেশনের জন্য।” প্রথম কাজটা কী?",
          en: "From an unknown number: “This is your uncle! I lost my old number, save this one. I need Tk 50,000 tomorrow morning for an urgent operation.” What is the first thing to do?",
        },
        options: [
          {
            id: "a",
            text: { bn: "মামার কথা তো — টাকার ব্যবস্থা করি", en: "It's my uncle — I arrange the money" },
          },
          {
            id: "b",
            text: { bn: "মামার পুরনো নম্বরে ফোন করে বা মামা-বাড়ির অন্য কাউকে জিজ্ঞেস করে সত্যতা যাচাই করি", en: "I verify by calling my uncle's old number or asking another family member" },
          },
          {
            id: "c",
            text: { bn: "নতুন নম্বরটা সেভ করি; টাকার কথা পরে ভাবি", en: "I save the new number and think about the money later" },
          },
        ],
        correct: "b",
        explanation: {
          bn: "পরিবারিক বিচক্ষণতা! পরিচিতের ছদ্মবেশে জরুরি টাকা চাওয়া অতি প্রচলিত প্রতারণা। পুরনো নম্বরে একটি কলই সত্য-মিথ্যা পরিষ্কার করে দেয়।",
          en: "Family wisdom! Urgent money requests in a relative's guise are extremely common. One call to the old number settles true or false.",
        },
      },
      {
        id: "imp-2",
        scenario: {
          bn: "আপনি পুরনো নম্বরে কল করলে মামা ধরলেন: “আমি তো ঠিকই আছি বাবা, কোনো অপারেশন নেই, নতুন নম্বরও নিইনি!” এখন কী করা উচিত?",
          en: "You call the old number and your uncle answers: “I am fine, there is no operation, and I never changed my number!” What should you do now?",
        },
        options: [
          {
            id: "a",
            text: { bn: "প্রতারকের নম্বরটি ব্লক করি, আত্মীয়দের সতর্ক করি এবং ঘটনাটি রিপোর্ট করি", en: "Block the scammer's number, warn relatives, and report the incident" },
          },
          {
            id: "b",
            text: { bn: "প্রতারককে ফোন করে বকা দিই", en: "Call the scammer back and scold them" },
          },
          {
            id: "c",
            text: { bn: "ব্যাপারটা চুপচাপ মেনে নিই", en: "Quietly let it go" },
          },
        ],
        correct: "a",
        explanation: {
          bn: "দায়িত্বশীল সিদ্ধান্ত! ব্লক করলে ওই নম্বর আর আপনাকে বিরক্ত করবে না, আর পরিবারকে জানালে অন্য কেউ ধরা পড়বে না। রিপোর্ট করলে আইনশৃঙ্খলা সংস্থাও সতর্ক হয়।",
          en: "Responsible choice! Blocking stops that number from pestering you, warning family protects others, and reporting keeps law enforcement alert.",
        },
      },
      {
        id: "imp-3",
        scenario: {
          bn: "একটি নম্বর বলছে: “আমি তোমার ব্যাংকের ম্যানেজার, নম্বরটা আমার পার্সোনাল। তোমার একাউন্ট নিয়ে আলোচনা কটি দরকার।” আপনার পদক্ষেপ?",
          en: "A caller says: “I am your bank's manager — this is my personal number. We must discuss your account.” Your step?",
        },
        options: [
          {
            id: "a",
            text: { bn: "ম্যানেজার নিজে ফোন করেছেন — কথা বলেই ফলে", en: "The manager called personally — I talk it through" },
          },
          {
            id: "b",
            text: { bn: "ব্যাংকের কথা বলতে হলে শাখার অফিসিয়াল নম্বরে/অ্যাপেই কথা হবে — ব্যক্তিগত নম্বর থেকে নয়", en: "Bank matters belong on the branch's official number or app — never a personal one" },
          },
          {
            id: "c",
            text: { bn: "প্রথমে শুনি, দরকারি মনে হলে তার বলা নম্বরেই যোগাযোগ করি", en: "I listen first and if it seems important, call the number he gives" },
          },
        ],
        correct: "b",
        explanation: {
          bn: "নিরাপদ নিয়ম মেনে চললেন! ব্যাংক-কর্মকর্তারা ব্যক্তিগত নম্বর থেকে গ্রাহকের একাউন্ট নিয়ে ফোন করেন না। 'তার বলা নম্বরে' কল করা মানে প্রতারকেরই সার্ভারে ফেরা — সবসময় কার্ড/অ্যাপের নম্বর ব্যবহার করুন।",
          en: "You followed the safe rule! Bank officials never discuss customer accounts from personal numbers. Calling 'the number he gives' routes you back to the scammer — always use the number on your card or app.",
        },
      },
    ],
  },
  {
    id: "ai-voice-scams",
    title: { bn: "এআই ভয়েস প্রতারণা", en: "AI voice scams" },
    summary: {
      bn: "কৃত্রিম বুদ্ধিমত্তা দিয়ে নকল গলা — শুনলে বিশ্বাস হয় না, তাই যাচাইয়ের নিয়ম জানুন।",
      en: "AI-copied voices sound exactly real — learn the verification rules that still protect you.",
    },
    icon: "AudioLines",
    minutes: 4,
    keyPoints: [
      { bn: "প্রযুক্তি এখন অন্যের গলার নকল করতে পারে — শুনে চেনা যায় না।", en: "Technology can now copy voices — you cannot tell by listening." },
      { bn: "যে-ই ফোন করুন, টাকা চাইলে বাধ্যত পুরনো/পরিচিত নম্বরে ফিরে কল করুন।", en: "No matter who calls, always call back on the known number before paying." },
      { bn: "পরিবারে একটি 'গোপন প্রশ্ন' ঠিক করে রাখুন — সন্দেহ হলে সেটি জিজ্ঞেস করুন।", en: "Agree on a family 'secret question' — ask it whenever in doubt." },
    ],
    questions: [
      {
        id: "ai-1",
        scenario: {
          bn: "রাতে ফোন — রিসিভারে মনে হলো নিজের ছোট ভাইয়ের গলাই: “ভাইয়া, আমি বিপদে আছি, তাড়াতাড়ি ২০ হাজার টাকা এই নম্বরে পাঠাও!” কী করবেন?",
          en: "A late-night call — it sounds exactly like your younger brother: “Bhai, I'm in trouble, quickly send Tk 20,000 to this number!” What do you do?",
        },
        options: [
          {
            id: "a",
            text: { bn: "গলা তো ভাইয়েরই — সঙ্গে সঙ্গে টাকা পাঠাই", en: "That's his voice — I send the money immediately" },
          },
          {
            id: "b",
            text: { bn: "গলা মিললেও আগে ভাইয়ের নিজের (পুরনো) নম্বরে ফোন করে নিশ্চিত হই", en: "Even if the voice matches, I first confirm by calling my brother's own number" },
          },
          {
            id: "c",
            text: { bn: "যে নম্বর থেকে কল এসেছে সেটিই ফিরতি কল দিয়ে যাচাই করি", en: "I verify by calling back the same number that rang me" },
          },
        ],
        correct: "b",
        explanation: {
          bn: "ভাইয়ের বাঁচা বুদ্ধি! এআই এখন গলার হুবহু নকল করতে পারে — কল করা নম্বরে ফেরত কল দিলে সেটি আবার প্রতারকের কাছেই যাবে। নিজের সেভ করা নম্বর থেকে করা কলই একমাত্র নির্ভরযোগ্য যাচাই।",
          en: "Lifesaving instinct! AI can clone a voice perfectly — and calling back the same number returns to the scammer. Dialing from your own saved contacts is the only reliable check.",
        },
      },
      {
        id: "ai-2",
        scenario: {
          bn: "ভাইয়ের নম্বরে কল করতেই সে হাসতে হাসতে বললো: “কী যে বলো! আমি তো বাসায় ভাত খাচ্ছি।” এখন ওই ভুয়া কলটি নিয়ে করণীয় কী?",
          en: "Your brother laughs: “What are you saying! I'm home eating rice.” What should you do about the fake call?",
        },
        options: [
          {
            id: "a",
            text: { bn: "নম্বরটি ব্লক করি, পরিবারে সবাইকে জানাই, ঘটনা ৯৯৯/সংশ্লিষ্ট সহায়তায় জানাই", en: "Block the number, inform the whole family, and report it via 999 or support channels" },
          },
          {
            id: "b",
            text: { bn: "ভাই ঠিকই তো, ব্যাপারটা ওই রাতেই ভুলে যাই", en: "My brother is fine — I forget about it that night" },
          },
          {
            id: "c",
            text: { bn: "স্ক্রিনশট না রেখে সব মুছে ফেলি", en: "I delete everything without keeping any record" },
          },
        ],
        correct: "a",
        explanation: {
          bn: "সতর্কতাই সুরক্ষা! এই ঘটনা ঘটেছে মানে আপনার পরিবার প্রতারকের তালিকায় পড়েছে। সবাইকে জানানো ও প্রমাণ রাখা জরুরি — রিকভারি বা অভিযোগের জন্য কাজে লাগবে।",
          en: "Vigilance is protection! This happening means your family is on a scammer's list. Informing everyone and preserving records matters — useful for recovery or complaints.",
        },
      },
      {
        id: "ai-3",
        scenario: {
        bn: "পরিবারের সবাই মিলে ঠিক করলেন: জরুরি টাকার কথা শুনলে একটি বাড়তি গোপন প্রশ্ন করা হবে (“দাদুর ডাকনাম কী?”)। এই নিয়মের সুবিধা কী?",
          en: "The family agrees: whenever urgent money is requested, ask an extra secret question (“What was grandfather's nickname?”). What is the benefit of this rule?",
        },
        options: [
          {
            id: "a",
            text: { bn: "কিছু যোগ হয় না — প্রতারক তো উত্তরও জানতে পারে", en: "It adds nothing — a scammer might learn the answer" },
          },
          {
            id: "b",
            text: { bn: "গলার নকল সম্ভব হলেও পারিবারিক তথ্যের নকল কঠিন — একটি সহজ অতিরিক্ত নিরাপত্তা-স্তর", en: "Voice can be copied, but family-only facts are hard to fake — a simple extra layer of protection" },
          },
          {
            id: "c",
            text: { bn: "প্রশ্ন করলে প্রিয় মানুষ মনে কষ্ট পাবে", en: "Asking would hurt my loved one's feelings" },
          },
        ],
        correct: "b",
        explanation: {
          bn: "প্রশংসনীয়! এআই গলা নকল করতে পারে, কিন্তু শুধু পরিবারের জানা ছোট্ট তথ্য জানতে পারে না। সদস্যরা যদি মন খারাপও করে, এক প্রশ্নেই লাখ টাকার প্রশ্ন মীমাংসা হয়।",
          en: "Commendable! AI can clone a voice but cannot know a small fact only the family knows. Even if a member feels hurt, one question settles a question worth hundreds of thousands.",
        },
      },
    ],
  },
  {
    id: "fake-shopping",
    title: { bn: "ভুয়া অনলাইন শপিং", en: "Fake online shopping" },
    summary: {
      bn: "অর্ধেক দামের লোভ, অগ্রিম পেমেন্ট আর পার্সেল ফাঁদ — সতর্ক ক্রেতা হোন।",
      en: "Half-price bait, advance payments, and parcel traps — become a careful shopper.",
    },
    icon: "ShoppingBag",
    minutes: 4,
    keyPoints: [
      { bn: "অস্বাভাবিক সস্তা অফার প্রায় সবসময়ই ভুয়া পেজের ছিনি।", en: "Unusually cheap offers are almost always fake-page hooks." },
      { bn: "পরিচিত না হলে 'অ্যাডভান্স' দেবেন না — ক্যাশ অন ডেলিভারিই নিরাপদ।", en: "Never pay 'advance' to unfamiliar sellers — cash on delivery is safer." },
      { bn: "পেজের রিভিউ, পুরনো পোস্ট আর যোগাযোগের ঠিকানা দেখে পরীক্ষা করুন।", en: "Inspect a page's reviews, post history, and contact details." },
    ],
    questions: [
      {
        id: "shop-1",
        scenario: {
          bn: "ফেসবুকে এক পেজ: “সিলভার গোল্ড প্লাস ইয়ারবাডস মাত্র ৭৯৯ টাকা! বাজার মূল্য ৩,৫০০। অফার আজই শেষ।” আপনি কী আঁচ করছেন?",
          en: "A Facebook page: “Silver Gold Plus earbuds only Tk 799! Market price Tk 3,500. Offer ends today.” What do you sense?",
        },
        options: [
          {
            id: "a",
            text: { bn: "দুর্দান্ত ডিল — এখনই অর্ডার করি", en: "Great deal — order right now" },
          },
          {
            id: "b",
            text: { bn: "দাম অস্বাভাবিক কম + 'আজই শেষ' চাপ = ভুয়া পেজের লক্ষণ — আগে যাচাই করি", en: "Abnormally cheap + 'ends today' pressure = fake-page signs — verify first" },
          },
          {
            id: "c",
            text: { bn: "বন্ধুরাও কিনলে আমিও কিনবো", en: "If friends buy, I'll buy too" },
          },
        ],
        correct: "b",
        explanation: {
          bn: "সঠিক আঁচ! খরচের অর্ধেকেরও কম দামে বড় ব্র্যান্ডের মাল বিক্রি বাস্তবে বিরল। তাড়াহুড়োর চাপ দিয়ে ভাবনার সময় কেড়ে নেওয়াই ভুয়া পেজের কৌশল।",
          en: "Right instinct! Big-brand goods below half price are rare in reality. 'Ends today' pressure exists to remove your thinking time — a fake-page tactic.",
        },
      },
      {
        id: "shop-2",
        scenario: {
          bn: "অর্ডার করতেই পেজ বললো: “কনফার্ম করতে ২০০ টাকা অ্যাডভান্স বিকাশ করুন, বাকিটা ডেলিভারিতে।” আপনার সিদ্ধান্ত?",
          en: "When ordering, the page says: “Send Tk 200 advance via bKash to confirm; pay the rest on delivery.” Your decision?",
        },
        options: [
          {
            id: "a",
            text: { bn: "২০০ টাকাই তো — পাঠিয়ে দিই", en: "It's only Tk 200 — I send it" },
          },
          {
            id: "b",
            text: { bn: "অচেনা পেজকে আগে টাকা নয় — সম্পূর্ণ ক্যাশ অন ডেলিভারি চাই, নাহলে কিনবো না", en: "No money first to an unknown page — full cash on delivery or I won't buy" },
          },
          {
            id: "c",
            text: { bn: "অ্যাডভান্স দিয়ে দিই; মাল না এলে পেজে কমেন্ট করবো", en: "I pay the advance and comment on the page if goods never arrive" },
          },
        ],
        correct: "b",
        explanation: {
          bn: "ক্রেতার অধিকার রক্ষা! একবার 'অ্যাডভান্স' গেলে ফেরতের পথ নেই — পেজ ব্লক করে হাওয়া। পুরো টাকা ডেলিভারিতে দেওয়ার নিয়মেই প্রতারণার ঝুঁকি প্রায় শূন্য।",
          en: "Consumer rights protected! Once an 'advance' is sent there is no way back — the page blocks you and vanishes. Full payment on delivery keeps fraud risk near zero.",
        },
      },
      {
        id: "shop-3",
        scenario: {
          bn: "এরপর একটি কুরিয়ার কল: “স্বাস্থ্য মন্ত্রণালয় থেকে আপনার নামে ফ্রি সানগ্লাস প্যাকেজ এসেছে, ডেলিভারি চার্জ মাত্র ২০০ টাকা।” আপনি কি অর্ডার করেছিলেন?",
          en: "Then a courier calls: “The Health Ministry sent you a free sunglasses parcel; the delivery charge is only Tk 200.” Did you order this?",
        },
        options: [
          {
            id: "a",
            text: { bn: "ফ্রি তো! ২০০ টাকা দিয়ে প্যাকেজ নিই", en: "It's free! I pay Tk 200 and take the parcel" },
          },
          {
            id: "b",
            text: { bn: "আমি কোনো অর্ডারই করিনি — অপ্রত্যাশিত পার্সেল + চার্জ মানেই প্রচলিত প্যাকেজ-প্রতারণা; না করি", en: "I never ordered — unexpected parcel + charge is the classic package scam; I refuse" },
          },
          {
            id: "c",
            text: { bn: "সরকারি উপহার হতে পারে — টাকা দিয়ে দেখি", en: "It could be a government gift — I pay and see" },
          },
        ],
        correct: "b",
        explanation: {
          bn: "নিখুঁত প্রত্যাখ্যান! স্বাস্থ্য মন্ত্রণালয় বা কোনো সরকারি দপ্তর সাধারণ মানুষকে ফ্রি সানগ্লাস পাঠায় না। যা অর্ডার করেননি, তার 'চার্জ' দেওয়া মানে প্রতারকের খরচ বহন করা।",
          en: "Impeccable refusal! Neither the Health Ministry nor any government department sends free sunglasses. Paying a 'charge' for unordered goods means funding the scammer.",
        },
      },
    ],
  },
];
