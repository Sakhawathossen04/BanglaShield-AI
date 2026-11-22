"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Mic,
  Square,
  Trash2,
  Upload,
  Play,
  MessageSquareText,
  Image as ImageIcon,
  Link2,
  QrCode,
  ShieldCheck,
  AudioLines,
  FileText,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { api, ShieldApiError } from "../api";
import { useLang } from "../i18n";
import { useSettings } from "../store";
import { InfoNote } from "../ui-bits";
import { Link as RouterLink, useHashRoute } from "../router";
import { cn } from "@/lib/utils";
import jsQR from "jsqr";
import { getDemoPreset } from "../demo-presets";

export default function CheckPage({ initialTab }: { initialTab?: string }) {
  const bn = useLang() === "bn";
  const validTab = ["voice", "message", "image", "link"].includes(initialTab ?? "")
    ? (initialTab as string)
    : "message";

  // V3: ?demo=<preset-id> loads a Judge Demo Mode preset into the actual flow.
  const demoId = typeof window !== "undefined"
    ? new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("demo")
    : null;
  const preset = demoId ? getDemoPreset(demoId) : undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 md:py-12">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#202C26] bn-text">
          {bn ? "সন্দেহজনক কনটেন্ট যাচাই করুন" : "Verify suspicious content"}
        </h1>
        <p className="mt-2 text-[#59665F] leading-relaxed bn-text">
          {bn
            ? "যেটা পেয়েছেন সেটাই দিন — বার্তা, কলের বর্ণনা, স্ক্রিনশট বা লিংক। বিশ্লেষণ শেষে প্রমাণসহ ফলাফল পাবেন। কোনো অ্যাকাউন্ট লাগবে না।"
            : "Submit whatever you received — a message, call description, screenshot or link. You will get an evidence-based result. No account needed."}
        </p>
      </div>

      {preset && (
        <div className="mb-5 rounded-xl border-2 border-dashed border-[#8A5B28]/60 bg-[#F2E8D5]/50 px-4 py-3 flex items-start gap-2.5">
          <Badge variant="outline" className="border-[#8A5B28]/60 text-[#8A5B28] shrink-0">
            {bn ? "ডেমো মোড" : "Demo mode"}
          </Badge>
          <p className="text-sm text-[#59665F] leading-relaxed bn-text">
            {bn
              ? `প্রি-লোড হয়েছে: ${preset.title.bn} — কাল্পনিক নকল উদাহরণ। আসল পাইপলাইনেই চলবে এবং ফলাফল “অফলাইন ডেমো” হিসেবে স্পষ্টভাবে চিহ্নিত হবে।`
              : `Preloaded: ${preset.title.en} — a fictional synthetic example. It runs through the real pipeline and the result is clearly labeled "offline demo".`}
          </p>
        </div>
      )}

      {/* key remounts Tabs when the /check/:tab route changes so defaultValue applies */}
      <Tabs key={validTab} defaultValue={validTab} className="gap-6">
        <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-4 bg-[#EDEAE1] p-1.5 rounded-xl">
          <TabTrigger value="voice" icon={<Mic className="h-4 w-4" aria-hidden />} label={bn ? "ভয়েস" : "Voice"} />
          <TabTrigger value="message" icon={<MessageSquareText className="h-4 w-4" aria-hidden />} label={bn ? "মেসেজ" : "Message"} />
          <TabTrigger value="image" icon={<ImageIcon className="h-4 w-4" aria-hidden />} label={bn ? "স্ক্রিনশট" : "Screenshot"} />
          <TabTrigger value="link" icon={<Link2 className="h-4 w-4" aria-hidden />} label={bn ? "লিংক/কিউআর" : "Link/QR"} />
        </TabsList>

        <TabsContent value="voice">
          <VoiceChecker demoText={preset?.modality === "voice" ? preset.text : undefined} demoAudio={preset?.modality === "voice" ? preset.audioSrc : undefined} />
        </TabsContent>
        <TabsContent value="message">
          <MessageChecker demoText={preset?.modality === "message" ? preset.text : undefined} />
        </TabsContent>
        <TabsContent value="image">
          <ImageChecker demoImageSrc={preset?.modality === "image" ? preset.imageSrc : undefined} />
        </TabsContent>
        <TabsContent value="link">
          <LinkChecker demoUrl={preset?.modality === "link" ? preset.url : undefined} demoId={preset?.modality === "link" ? preset.id : undefined} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TabTrigger({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) {
  return (
    <TabsTrigger
      value={value}
      className="flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold data-[state=active]:bg-[#FFFEFA] data-[state=active]:text-[#2F5746] data-[state=active]:shadow-sm text-[#59665F] bn-text"
    >
      {icon}
      {label}
    </TabsTrigger>
  );
}

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

function ConsentGate({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children?: React.ReactNode }) {
  const bn = useLang() === "bn";
  return (
    <div className={cn("rounded-xl border border-dashed border-[#8A5B28]/50 bg-[#F2E8D5]/50 p-4")}>
      <label className="flex cursor-pointer items-start gap-3">
        <Checkbox
          checked={checked}
          onCheckedChange={(v) => onChange(v === true)}
          className="mt-0.5 border-[#8A5B28] data-[state=checked]:bg-[#2F5746]"
          aria-label={bn ? "সম্মতি" : "Consent"}
        />
        <span className="text-sm text-[#59665F] leading-relaxed bn-text">
          {bn ? (
            <>
              আমি বুঝেছি: আমার দেওয়া লেখা/অডিও/ছবি <strong>সংরক্ষণ না করে</strong> প্রতারণা-যাচাইয়ের জন্য প্রক্রিয়া করা হবে; সংবেদনশীল তথ্য (ওটিপি, পিন, নম্বর) স্বয়ংক্রিয়ভাবে আড়াল করা হবে। ফোন কল বাংলাশিল্ড কখনোই রেকর্ড করে না।
            </>
          ) : (
            <>
              I understand: my text/audio/image will be processed <strong>without being stored</strong> for scam verification; sensitive data (OTPs, PINs, numbers) is redacted automatically. BanglaShield never records phone calls.
            </>
          )}
        </span>
      </label>
      {children}
    </div>
  );
}

function useAnalysisLauncher() {
  const { navigate } = useHashRoute();
  const bn = useLang() === "bn";

  const createSession = useCallback(
    async (modality: "voice" | "message" | "image" | "link") => {
      const res = await api.post<{ id: string }>("/api/v1/analyses", {
        modality,
        language: bn ? "bn" : "en",
        consentAnalysis: true,
      });
      return res.id;
    },
    [bn]
  );

  const fail = (err: unknown) => {
    if (err instanceof ShieldApiError) {
      toast.error(err.apiError.message);
    } else {
      toast.error(bn ? "নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন" : "Network problem — please retry");
    }
  };

  return { createSession, navigate, fail };
}

function AnalyzeButton({
  disabled,
  onClick,
  busy,
  label,
}: {
  disabled?: boolean;
  onClick: () => void;
  busy?: boolean;
  label?: string;
}) {
  const bn = useLang() === "bn";
  return (
    <Button
      size="lg"
      disabled={disabled || busy}
      onClick={onClick}
      className="h-14 px-8 text-lg font-bold bg-[#2F5746] text-[#FFFEFA] hover:bg-[#24453A] rounded-xl gap-2 disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <ShieldCheck className="h-5 w-5" aria-hidden />}
      {busy ? (bn ? "বিশ্লেষণ চলছে…" : "Analyzing…") : (label ?? (bn ? "নিরাপত্তা যাচাই করুন" : "Analyze now"))}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Message checker
// ---------------------------------------------------------------------------

const SAMPLE_MESSAGE =
  "প্রিয় গ্রাহক, আমি বিকাশ টিম থেকে বলছি। আপনার একাউন্ট সাসপেন্ড হতে চলেছে। একাউন্ট চালু রাখতে এখনই আপনার OTP টা দিয়ে দিন। দেরি করলে নম্বর বন্ধ হয়ে যাবে।";

function MessageChecker({ demoText }: { demoText?: string }) {
  const bn = useLang() === "bn";
  const [text, setText] = useState(demoText ?? "");
  const [isDemo] = useState(Boolean(demoText));
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const { createSession, navigate, fail } = useAnalysisLauncher();

  const analyze = async () => {
    if (text.trim().length < 4) {
      toast.error(bn ? "বার্তাটি আরেকটু লিখুন" : "Please write a bit more of the message");
      return;
    }
    setBusy(true);
    try {
      const id = await createSession("message");
      await api.post(`/api/v1/analyses/${id}/input`, { kind: "text", text, demo: isDemo });
      navigate(`/analysis/${id}`);
    } catch (err) {
      fail(err);
      setBusy(false);
    }
  };

  return (
    <Card className="border border-[#D8DED5] bg-[#FFFEFA]">
      <CardContent className="p-5 md:p-6 space-y-5">
        <div>
          <Label htmlFor="message-input" className="text-base font-bold text-[#202C26] bn-text">
            {bn ? "সন্দেহজনক এসএমএস / হোয়াটসঅ্যাপ / মেসেঞ্জার বার্তা পেস্ট করুন" : "Paste the suspicious SMS / WhatsApp / Messenger message"}
          </Label>
          <p className="mt-1 text-sm text-[#59665F] bn-text">
            {bn
              ? "প্রেরকের নাম-নম্বরসহ যতটা সম্ভব হুবহু কপি করুন। ওটিপি-পিন থাকলেও চিন্তা নেই — পাঠানোর আগে আমরা সেটি আড়াল করে নিই।"
              : "Copy it as-is, including the sender's name/number. If it contains OTPs/PINs we redact them automatically before anything is sent."}
          </p>
          <Textarea
            id="message-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            maxLength={8000}
            placeholder={bn ? "বার্তাটি এখানে পেস্ট করুন…" : "Paste the message here…"}
            className="mt-3 text-[15px] leading-relaxed bg-[#FFFEFA] border-[#D8DED5] focus-visible:ring-[#2F5746] bn-text"
          />
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setText(SAMPLE_MESSAGE)}
              className="text-xs font-semibold text-[#2F5746] hover:underline focus-ring rounded bn-text"
            >
              {bn ? "উদাহরণ দিয়ে দেখুন" : "Try a sample"}
            </button>
            <span className="text-xs text-[#59665F] tabular-nums">{text.length}/8000</span>
          </div>
        </div>

        <ConsentGate checked={consent} onChange={setConsent} />

        <div className="flex flex-col sm:flex-row gap-3">
          <AnalyzeButton disabled={!consent || text.trim().length < 4} busy={busy} onClick={analyze} />
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Voice checker — record (MediaRecorder) or upload, ASR, editable transcript
// ---------------------------------------------------------------------------

function VoiceChecker({ demoText, demoAudio }: { demoText?: string; demoAudio?: string }) {
  const bn = useLang() === "bn";
  const [consent, setConsent] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [transcriptOk, setTranscriptOk] = useState<boolean | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [caseId, setCaseId] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { createSession, navigate, fail } = useAnalysisLauncher();

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setSeconds(0);
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime || "audio/webm" });
        if (blob.size < 1200) {
          toast.error(bn ? "রেকর্ডিং খুব ছোট — আবার বলুন" : "Recording too short — please try again");
        } else {
          setAudioBlob(blob);
          setAudioUrl(URL.createObjectURL(blob));
        }
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRef.current = recorder;
      recorder.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s >= 120) {
            stopRecording();
            return s;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      toast.error(
        bn
          ? "মাইক্রোফোন ব্যবহারের অনুমতি পাওয়া যায়নি — নিচের আপলোড অপশন বা টাইপ করার অপশন ব্যবহার করুন"
          : "Microphone permission denied — use the upload option or type instead"
      );
    }
  };

  const stopRecording = () => {
    if (mediaRef.current && mediaRef.current.state === "recording") mediaRef.current.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const onUpload = (file: File) => {
    if (file.size > 6.5 * 1024 * 1024) {
      toast.error(bn ? "ফাইলটি খুব বড় (সর্বোচ্চ ৬.৫ মেগাবাইট)" : "File too large (max 6.5 MB)");
      return;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(file);
    setAudioUrl(URL.createObjectURL(file));
    setTranscript("");
    setTranscriptOk(null);
  };

  const transcribe = async () => {
    if (!audioBlob) return;
    if (!caseId) {
      try {
        const id = await createSession("voice");
        setCaseId(id);
        await runTranscribe(id);
      } catch (err) {
        fail(err);
      }
    } else {
      await runTranscribe(caseId);
    }
  };

  const runTranscribe = async (id: string) => {
    setTranscribing(true);
    try {
      const b64 = await blobToBase64(audioBlob!);
      const res = await api.post<{ status: string; transcriptOk?: boolean; transcript?: string; message?: string }>(
        `/api/v1/analyses/${id}/input`,
        { kind: "audio", audioBase64: b64, mime: pickMime(audioBlob!) }
      );
      setTranscriptOk(res.transcriptOk ?? false);
      if (res.transcript) setTranscript(res.transcript);
      else if (res.message) toast.info(res.message);
    } catch (err) {
      fail(err);
    } finally {
      setTranscribing(false);
    }
  };

  const analyzeTranscript = async () => {
    if (!caseId || transcript.trim().length < 2) return;
    setAnalyzing(true);
    try {
      await api.post(`/api/v1/analyses/${caseId}/input`, { kind: "confirm", text: transcript });
      navigate(`/analysis/${caseId}`);
    } catch (err) {
      fail(err);
      setAnalyzing(false);
    }
  };

  // V3 demo transcript: Rahela's fictional case — submits as OFFLINE_DEMO text.
  const [demoTranscript, setDemoTranscript] = useState(demoText ?? "");
  const [demoBusy, setDemoBusy] = useState(false);
  const analyzeDemo = async () => {
    if (demoTranscript.trim().length < 4) return;
    setDemoBusy(true);
    try {
      const id = await createSession("voice");
      await api.post(`/api/v1/analyses/${id}/input`, { kind: "text", text: demoTranscript, demo: true });
      navigate(`/analysis/${id}`);
    } catch (err) {
      fail(err);
      setDemoBusy(false);
    }
  };

  const showTranscriptStep = audioBlob !== null;

  return (
    <Card className="border border-[#D8DED5] bg-[#FFFEFA]">
      <CardContent className="p-5 md:p-6 space-y-5">
        {/* V3 demo transcript — Rahela's fictional case */}
        {demoText && (
          <div className="rounded-2xl border-2 border-dashed border-[#8A5B28]/60 bg-[#F2E8D5]/40 p-4 md:p-5 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="font-bold text-[#8A5B28] bn-text flex items-center gap-2">
                <Badge variant="outline" className="border-[#8A5B28]/60 text-[#8A5B28]">
                  {bn ? "ডেমো · কাল্পনিক" : "Demo · fictional"}
                </Badge>
                {bn ? "রাহেলার ফোনকলের ট্রান্সক্রিপ্ট" : "Transcript of Rahela's call"}
              </p>
              {demoAudio && (
                <audio controls src={demoAudio} className="h-9 max-w-[220px]" aria-label={bn ? "নমুনা কণ্ঠ শুনুন" : "Listen to the sample voice"} />
              )}
            </div>
            <Textarea
              value={demoTranscript}
              onChange={(e) => setDemoTranscript(e.target.value)}
              rows={4}
              maxLength={8000}
              aria-label={bn ? "ডেমো ট্রান্সক্রিপ্ট (সম্পাদনাযোগ্য)" : "Demo transcript (editable)"}
              className="text-[15px] leading-relaxed bg-[#FFFEFA] border-[#D8DED5] focus-visible:ring-[#2F5746] bn-text"
            />
            <p className="text-xs text-[#59665F] bn-text">
              {bn
                ? "চাইলে সম্পাদনা করুন। বোতামে চাপলে আসল পাইপলাইনে বিশ্লেষণ হবে — ফলাফল “অফলাইন ডেমো” হিসেবে স্পষ্টভাবে চিহ্নিত থাকবে। কণ্ঠটি আসল না এআই-নকল, তা যাচাই করা যায় না — সেটিও ফলাফলে সততার সাথে লেখা থাকবে।"
                : "Edit if you like. The button runs the REAL pipeline — the result stays clearly labeled \"offline demo\". Whether the voice is real or AI-cloned cannot be verified — the result says so honestly too."}
            </p>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label className="flex cursor-pointer items-start gap-2.5">
                <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5 border-[#8A5B28] data-[state=checked]:bg-[#2F5746]" />
                <span className="text-sm text-[#59665F] leading-relaxed bn-text">
                  {bn ? "ডেমো ট্রান্সক্রিপ্টটি বিশ্লেষণে পাঠানোর সম্মতি দিচ্ছি।" : "I consent to analyzing this demo transcript."}
                </span>
              </label>
              <Button
                size="lg"
                onClick={analyzeDemo}
                disabled={!consent || demoTranscript.trim().length < 4 || demoBusy}
                className="h-12 px-6 bg-[#2F5746] text-[#FFFEFA] hover:bg-[#24453A] rounded-xl gap-2 font-bold"
              >
                {demoBusy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <ShieldCheck className="h-5 w-5" aria-hidden />}
                {bn ? "ডেমো ট্রান্সক্রিপ্ট বিশ্লেষণ করুন" : "Analyze demo transcript"}
              </Button>
            </div>
          </div>
        )}

        <div>
          <Label className="text-base font-bold text-[#202C26] bn-text">
            {bn ? "নিজের ভাষায় বলুন কী হয়েছে" : "Describe what happened in your own voice"}
          </Label>
          <p className="mt-1 text-sm text-[#59665F] bn-text">
            {bn
              ? "যেমন: “আজ একটা নম্বর থেকে ফোন এসে বললো আমার বিকাশ একাউন্ট বন্ধ হবে, ওটিপি চাইলো…” — বাংলা বা বাংলিশ দুটোই চলবে।"
              : "For example: 'Today a number called saying my bKash account will be blocked and asked for an OTP…' — Bangla or Banglish both work."}
          </p>
        </div>

        {/* recorder */}
        <div className="rounded-2xl border-2 border-[#DDE8DF] bg-[#F4F1EB] p-6 flex flex-col items-center gap-4">
          {recording ? (
            <>
              <div className="flex items-end gap-1 h-12" aria-hidden>
                {Array.from({ length: 13 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-2 rounded-full bg-[#2F5746] wave-bar"
                    style={{ height: `${18 + ((i * 37) % 30)}px`, animationDelay: `${i * 0.09}s` }}
                  />
                ))}
              </div>
              <p className="text-2xl font-bold text-[#A44435] tabular-nums" role="timer" aria-live="off">
                {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
              </p>
              <p className="text-sm text-[#59665F] bn-text" aria-live="polite">
                {bn ? "শুনছি… বলা শেষ হলে থামান" : "Listening… press stop when done"}
              </p>
              <Button
                size="lg"
                onClick={stopRecording}
                className="h-12 px-6 bg-[#A44435] text-[#FFFEFA] hover:bg-[#8C382B] rounded-xl gap-2 font-bold"
              >
                <Square className="h-5 w-5 fill-current" aria-hidden />
                {bn ? "থামান" : "Stop"}
              </Button>
            </>
          ) : (
            <>
              <Button
                size="lg"
                onClick={startRecording}
                disabled={!consent}
                className="h-20 w-20 rounded-full bg-[#2F5746] text-[#FFFEFA] hover:bg-[#24453A] shadow-lg disabled:opacity-40"
                aria-label={bn ? "রেকর্ড শুরু করুন" : "Start recording"}
              >
                <Mic className="h-8 w-8" aria-hidden />
              </Button>
              <p className="text-sm font-medium text-[#59665F] bn-text">
                {bn ? "মাইকে চাপ দিয়ে বলা শুরু করুন (সর্বোচ্চ ২ মিনিট)" : "Tap the mic and start speaking (max 2 minutes)"}
              </p>
              <label className="text-sm">
                <span className="cursor-pointer inline-flex items-center gap-1.5 text-[#2F5746] font-semibold hover:underline focus-ring rounded">
                  <Upload className="h-4 w-4" aria-hidden />
                  {bn ? "বা অডিও ফাইল আপলোড করুন" : "or upload an audio file"}
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUpload(f);
                  }}
                />
              </label>
            </>
          )}
        </div>

        {/* preview + delete */}
        {audioUrl && !recording && (
          <div className="flex items-center gap-3 rounded-xl border border-[#D8DED5] bg-[#FFFEFA] p-3">
            <AudioLines className="h-5 w-5 text-[#2F5746] shrink-0" aria-hidden />
            <audio controls src={audioUrl} className="h-10 w-full" aria-label={bn ? "রেকর্ডিং প্রিভিউ" : "Recording preview"} />
            <Button
              variant="outline"
              size="icon"
              onClick={cleanup}
              className="shrink-0 border-[#A44435]/40 text-[#A44435] hover:bg-[#F4E1DA]"
              aria-label={bn ? "রেকর্ডিং মুছুন" : "Delete recording"}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        )}

        <ConsentGate checked={consent} onChange={setConsent} />

        {showTranscriptStep && (
          <div className="space-y-3 rounded-xl border border-[#D8DED5] p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-bold text-[#202C26]">
                <FileText className="h-4 w-4 text-[#2F5746]" aria-hidden />
                {bn ? "ধ্বনি থেকে লেখা (যাচাই করে ঠিক করুন)" : "Speech-to-text (review and edit)"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={transcribe}
                disabled={!consent || transcribing}
                className="border-[#2F5746]/50 text-[#2F5746] hover:bg-[#DDE8DF] gap-1.5"
              >
                {transcribing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <RefreshCw className="h-4 w-4" aria-hidden />}
                {transcriptOk === null
                  ? bn ? "লেখায় রূপান্তর করুন" : "Transcribe"
                  : bn ? "আবার চেষ্টা করুন" : "Retry transcription"}
              </Button>
            </div>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={5}
              placeholder={bn ? "রূপান্তর এখানে আসবে — না এলে নিজে লিখে দিন…" : "The transcript will appear here — or type it yourself…"}
              className="bg-[#FFFEFA] border-[#D8DED5] focus-visible:ring-[#2F5746] bn-text"
              aria-label={bn ? "সম্পাদনাযোগ্য প্রতিলিপি" : "Editable transcript"}
            />
            {transcriptOk === false && (
              <p className="text-sm text-[#8A5B28] bn-text">
                {bn
                  ? "স্বয়ংক্রিয় রূপান্তর স্পষ্ট হয়নি — উপরের ঘরে ঘটনাটি নিজের ভাষায় লিখে দিন, তারপর যাচাই করুন।"
                  : "Automatic transcription was unclear — type the incident yourself above, then analyze."}
              </p>
            )}
            {transcriptOk === true && !/[\u0980-\u09FF]/.test(transcript) && (
              <p className="rounded-lg border border-dashed border-[#8A5B28]/50 bg-[#F2E8D5]/60 px-3 py-2 text-sm text-[#8A5B28] bn-text" role="status">
                {bn
                  ? "সতর্কতা: স্বয়ংক্রিয় ধ্বনি-রূপান্তর বাংলা ভাষায় এখনো নির্ভরযোগ্য নয় — উপরের লেখাটি চোখে দেখে ঠিক করে নিন (বাংলা বা বাংলিশে লিখলেই চলবে)।"
                  : "Note: automatic speech-to-text is not yet reliable for Bangla — please review and correct the text above (Bangla or Banglish both work)."}
              </p>
            )}
            <AnalyzeButton disabled={transcript.trim().length < 2} busy={analyzing} onClick={analyzeTranscript} />
          </div>
        )}

        {!audioBlob && (
          <InfoNote title={bn ? "বিকল্প পথ" : "Alternative"}>
            {bn
              ? "মাইক না থাকলে বা লজ্জা লাগলে “মেসেজ” ট্যাবে গিয়ে হোয়াটসঅ্যাপ বার্তাটি টাইপ/পেস্ট করুন — একই বিশ্লেষণ পাবেন।"
              : "If you have no mic or prefer typing, use the Message tab — you get the same analysis."}
          </InfoNote>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Image checker — upload, VLM OCR, review extracted text
// ---------------------------------------------------------------------------

function ImageChecker({ demoImageSrc }: { demoImageSrc?: string }) {
  const bn = useLang() === "bn";
  const [consent, setConsent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState("");
  const [visualNotes, setVisualNotes] = useState<string[]>([]);
  const [ocrOk, setOcrOk] = useState<boolean | null>(null);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const { createSession, navigate, fail } = useAnalysisLauncher();

  // V3 demo: auto-load the synthetic screenshot from /public and stage it.
  const [demoStaged, setDemoStaged] = useState(false);
  useEffect(() => {
    if (!demoImageSrc || demoStaged) return;
    let alive = true;
    fetch(demoImageSrc)
      .then((r) => r.blob())
      .then(async (blob) => {
        if (!alive) return;
        const f = new File([blob], "demo-screenshot.png", { type: blob.type || "image/png" });
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setExtracted("");
        setOcrOk(null);
        setVisualNotes([]);
        setDemoStaged(true);
      })
      .catch(() => {
        if (alive) toast.error(bn ? "ডেমো ছবিটি লোড করা যায়নি" : "Could not load the demo image");
      });
    return () => {
      alive = false;
    };
  }, [demoImageSrc]);

  const onFile = (f: File) => {
    if (!["image/png", "image/jpeg", "image/webp"].includes(f.type)) {
      toast.error(bn ? "শুধু PNG / JPG / WebP ছবি গ্রহণযোগ্য" : "Only PNG / JPG / WebP images are accepted");
      return;
    }
    if (f.size > 4.5 * 1024 * 1024) {
      toast.error(bn ? "ছবিটি খুব বড় (সর্বোচ্চ ৪.৫ মেগাবাইট)" : "Image too large (max 4.5 MB)");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setExtracted("");
    setOcrOk(null);
    setVisualNotes([]);
  };

  const extract = async () => {
    if (!file) return;
    setExtracting(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const id = await createSession("image");
      setCaseId(id);
      const res = await api.post<{
        status: string;
        ocrOk?: boolean;
        extractedText?: string;
        visualNotes?: string[];
        message?: string;
      }>(`/api/v1/analyses/${id}/input`, { kind: "image", imageDataUrl: dataUrl });
      setOcrOk(res.ocrOk ?? false);
      if (res.extractedText) setExtracted(res.extractedText);
      if (res.visualNotes) setVisualNotes(res.visualNotes);
      if (res.message && !res.extractedText) toast.info(res.message);
    } catch (err) {
      fail(err);
    } finally {
      setExtracting(false);
    }
  };

  const analyze = async () => {
    if (!caseId || extracted.trim().length < 2) return;
    setAnalyzing(true);
    try {
      await api.post(`/api/v1/analyses/${caseId}/input`, { kind: "confirm", text: extracted, visualNotes });
      navigate(`/analysis/${caseId}`);
    } catch (err) {
      fail(err);
      setAnalyzing(false);
    }
  };

  return (
    <Card className="border border-[#D8DED5] bg-[#FFFEFA]">
      <CardContent className="p-5 md:p-6 space-y-5">
        <div>
          <Label className="text-base font-bold text-[#202C26] bn-text">
            {bn ? "স্ক্রিনশট আপলোড করুন" : "Upload the screenshot"}
          </Label>
          <p className="mt-1 text-sm text-[#59665F] bn-text">
            {bn
              ? "এসএমএস, হোয়াটসঅ্যাপ, মেসেঞ্জার বা ওয়েবপেজের স্ক্রিনশট — ছবি থেকে লেখা বের করে আপনি দেখে নিয়ে তারপর বিশ্লেষণ হবে। ছবিটি সার্ভারে সংরক্ষণ করা হয় না।"
              : "SMS, WhatsApp, Messenger or webpage screenshot — text is extracted for your review first. The image itself is never stored."}
          </p>
        </div>

        <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-[#D8DED5] bg-[#F4F1EB] p-6 text-center transition-colors hover:border-[#2F5746]/50 focus-ring">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
            aria-label={bn ? "ছবি নির্বাচন" : "Choose image"}
          />
          {preview ? (
            <div className="space-y-3">
                            <img
                src={preview}
                alt={bn ? "আপলোড করা স্ক্রিনশট প্রিভিউ" : "Uploaded screenshot preview"}
                className="mx-auto max-h-64 rounded-lg border border-[#D8DED5] object-contain"
              />
              <span className="text-xs text-[#59665F]">{file?.name} · {((file?.size ?? 0) / 1024).toFixed(0)} KB</span>
            </div>
          ) : (
            <span className="flex flex-col items-center gap-2 text-[#59665F]">
              <ImageIcon className="h-10 w-10 text-[#7D9C8B]" aria-hidden />
              <span className="font-medium bn-text">{bn ? "ছবি নির্বাচন করতে চাপ দিন" : "Tap to choose an image"}</span>
              <span className="text-xs">PNG · JPG · WebP · ≤ 4.5 MB</span>
            </span>
          )}
        </label>

        <ConsentGate checked={consent} onChange={setConsent}>
          {preview && (
            <div className="mt-3">
              <Button
                onClick={extract}
                disabled={!consent || extracting}
                className="bg-[#2F5746] text-[#FFFEFA] hover:bg-[#24453A] gap-2 font-bold"
              >
                {extracting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
                {extracting
                  ? bn ? "লেখা বের করা হচ্ছে…" : "Extracting text…"
                  : bn ? "ছবি থেকে লেখা বের করুন" : "Extract text from image"}
              </Button>
            </div>
          )}
        </ConsentGate>

        {ocrOk !== null && (
          <div className="space-y-3 rounded-xl border border-[#D8DED5] p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-[#202C26] bn-text">
              <FileText className="h-4 w-4 text-[#2F5746]" aria-hidden />
              {bn ? "বের করা লেখা — চোখে দেখে ঠিক করুন" : "Extracted text — review and fix"}
            </p>
            <Textarea
              value={extracted}
              onChange={(e) => setExtracted(e.target.value)}
              rows={6}
              placeholder={bn ? "লেখা এখানে আসবে…" : "Extracted text appears here…"}
              className="bg-[#FFFEFA] border-[#D8DED5] focus-visible:ring-[#2F5746] bn-text"
              aria-label={bn ? "সম্পাদনাযোগ্য নিষ্কাশিত লেখা" : "Editable extracted text"}
            />
            {visualNotes.length > 0 && (
              <div className="rounded-lg bg-[#F4F1EB] p-3">
                <p className="text-xs font-bold text-[#59665F] mb-1.5">
                  {bn ? "ছবিতে দেখা যায় যে (যাচাইকৃত নয়):" : "Visually observed (unverified):"}
                </p>
                <ul className="space-y-1">
                  {visualNotes.map((n, i) => (
                    <li key={i} className="text-xs text-[#59665F] bn-text">• {n}</li>
                  ))}
                </ul>
              </div>
            )}
            <AnalyzeButton disabled={extracted.trim().length < 2} busy={analyzing} onClick={analyze} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Link / QR checker
// ---------------------------------------------------------------------------

function LinkChecker({ demoUrl, demoId }: { demoUrl?: string; demoId?: string }) {
  const bn = useLang() === "bn";
  const [url, setUrl] = useState(demoUrl ?? "");
  const [isDemo] = useState(Boolean(demoUrl));
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [qrDecoded, setQrDecoded] = useState<string | null>(null);
  const { createSession, navigate, fail } = useAnalysisLauncher();

  const onQrFile = async (f: File) => {
    try {
      const bitmap = await createImageBitmap(f);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no-canvas");
      ctx.drawImage(bitmap, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(data.data, data.width, data.height);
      if (code?.data) {
        setQrDecoded(code.data);
        setUrl(code.data);
        toast.success(bn ? "কিউআর কোড পড়া হয়েছে — নিচে গন্তব্য দেখুন" : "QR decoded — see the destination below");
      } else {
        toast.error(bn ? "কিউআর কোড পাওয়া যায়নি — পরিষ্কার ছবি দিন" : "No QR code found — try a clearer image");
      }
    } catch {
      toast.error(bn ? "ছবিটি পড়া যায়নি" : "Could not read the image");
    }
  };

  const analyze = async () => {
    const target = url.trim();
    if (target.length < 3) return;
    setBusy(true);
    try {
      const id = await createSession("link");
      await api.post(`/api/v1/analyses/${id}/input`, {
        kind: "link",
        url: target,
        note: note || undefined,
        ...(isDemo ? { demo: true } : {}),
      });
      navigate(`/analysis/${id}`);
    } catch (err) {
      fail(err);
      setBusy(false);
    }
  };

  return (
    <Card className="border border-[#D8DED5] bg-[#FFFEFA]">
      <CardContent className="p-5 md:p-6 space-y-5">
        <div>
          <Label htmlFor="link-input" className="text-base font-bold text-[#202C26] bn-text">
            {bn ? "সন্দেহজনক লিংক বা কিউআর কোড" : "Suspicious link or QR code"}
          </Label>
          <p className="mt-1 text-sm text-[#59665F] bn-text">
            {bn
              ? "লিংকটি কখনোই আমরা খুলে দেখি না — ঠিকানার গঠন, ব্র্যান্ড-ছদ্মবেশ ও পরিচিত প্রতারণার নমুনা থেকে যাচাই করা হয়।"
              : "We never open the link — the address structure, brand impersonation and known scam patterns are checked instead."}
          </p>
          <Input
            id="link-input"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setQrDecoded(null);
            }}
            placeholder="উদাহরণ: bkash-verify.xyz/login"
            className="mt-3 bg-[#FFFEFA] border-[#D8DED5] focus-visible:ring-[#2F5746]"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="rounded-xl border border-[#D8DED5] bg-[#F4F1EB] p-4">
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="flex items-center gap-2 text-sm font-medium text-[#59665F] bn-text">
              <QrCode className="h-5 w-5 text-[#2F5746]" aria-hidden />
              {bn ? "কিউআর ছবি থেকে পড়ুন (ফোনেই ডিকোড হয়)" : "Decode from a QR image (decoded on your phone)"}
            </span>
            <span className="text-xs font-bold text-[#2F5746] hover:underline">{bn ? "ছবি দিন" : "Choose"}</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onQrFile(f);
              }}
              aria-label={bn ? "কিউআর ছবি আপলোড" : "Upload QR image"}
            />
          </label>
          {qrDecoded && (
            <p className="mt-3 rounded-lg bg-[#FFFEFA] border border-[#D8DED5] px-3 py-2 text-sm break-all">
              <span className="font-bold text-[#8A5B28]">{bn ? "কিউআরের গন্তব্য: " : "QR destination: "}</span>
              <span className="text-[#202C26]">{qrDecoded}</span>
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="link-note" className="text-sm font-semibold text-[#59665F] bn-text">
            {bn ? "কোথা থেকে পেলেন? (ঐচ্ছিক — বর্ণনা)" : "Where did you get it? (optional context)"}
          </Label>
          <Input
            id="link-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={bn ? "যেমন: এসএমএসে এসেছে, বললো বিকাশ ক্যাশব্যাক…" : "e.g. arrived by SMS claiming a bKash cashback…"}
            className="mt-2 bg-[#FFFEFA] border-[#D8DED5] focus-visible:ring-[#2F5746] bn-text"
            maxLength={1000}
          />
        </div>

        <ConsentGate checked={consent} onChange={setConsent} />

        <InfoNote title={bn ? "নিরাপত্তা নীতি" : "Safety policy"}>
          {bn
            ? "লিংকে ক্লিক না করেই যাচাই করুন। বাংলাশিল্ড কোনো লিংক স্বয়ংক্রিয়ভাবে খোলে না — তাই গন্তব্য পৃষ্ঠার বাস্তব অবস্থা ফলাফলে 'অজানা' হিসেবেই থাকে। লিংকে সন্দেহ হলে কখনোই নিজে খুলবেন না।"
            : "Verify without clicking. BanglaShield never opens links automatically — the destination page's real state remains 'unknown' in the result. If in doubt, never open it yourself."}
        </InfoNote>

        <AnalyzeButton disabled={!consent || url.trim().length < 3} busy={busy} onClick={analyze} />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(blob);
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });
}

function pickMime(blob: Blob): "audio/webm" | "audio/mp4" | "audio/mpeg" | "audio/wav" | "audio/ogg" | "audio/aac" | "audio/mp3" {
  const t = blob.type || "";
  if (t.includes("webm")) return "audio/webm";
  if (t.includes("mp4") || t.includes("m4a")) return "audio/mp4";
  if (t.includes("mpeg")) return "audio/mpeg";
  if (t.includes("mp3")) return "audio/mp3";
  if (t.includes("wav")) return "audio/wav";
  if (t.includes("ogg")) return "audio/ogg";
  if (t.includes("aac")) return "audio/aac";
  return "audio/webm";
}

