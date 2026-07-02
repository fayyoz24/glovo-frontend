import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Send, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../api/client";

const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "dasturxon_bot";
const CODE_LENGTH = 6;

export default function LoginPage() {
  const { verifyCode, isAuthed } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (isAuthed) {
      navigate(location.state?.from?.pathname || "/", { replace: true });
    }
  }, [isAuthed]); // eslint-disable-line react-hooks/exhaustive-deps

  const focusInput = (i) => inputsRef.current[i]?.focus();

  const handleChange = (i, value) => {
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < CODE_LENGTH - 1) focusInput(i + 1);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) focusInput(i - 1);
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!text) return;
    e.preventDefault();
    setDigits(Array.from({ length: CODE_LENGTH }, (_, i) => text[i] || ""));
    focusInput(Math.min(text.length, CODE_LENGTH - 1));
  };

  const code = digits.join("");
  const complete = code.length === CODE_LENGTH;

  const submit = async (e) => {
    e.preventDefault();
    if (!complete || submitting) return;
    setSubmitting(true);
    try {
      await verifyCode(code);
      toast.success("Xush kelibsiz!");
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.status === 400 || err.status === 404
            ? "Kod noto'g'ri yoki muddati tugagan"
            : err.message
          : "Xatolik yuz berdi";
      toast.error(msg);
      setDigits(Array(CODE_LENGTH).fill(""));
      focusInput(0);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center gap-8 py-8">
      <div className="text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-tile bg-ink text-marigold shadow-tile">
          <Send size={26} />
        </div>
        <h1 className="font-display text-2xl text-ink">Telegram orqali kiring</h1>
        <p className="mt-2 text-sm text-ink/60">
          Parol yo'q — faqat botdan olingan bir martalik kod bilan tizimga kirasiz.
        </p>
      </div>

      <ol className="space-y-3 rounded-tile border-2 border-ink/10 bg-white p-4 text-sm">
        <li className="flex items-start gap-3">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-marigold text-xs font-bold text-ink">
            1
          </span>
          <span className="pt-0.5">
            Telegram-da{" "}
            <a
              href={`https://t.me/${BOT_USERNAME}`}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-ceramic-dark underline underline-offset-2"
            >
              @{BOT_USERNAME}
            </a>{" "}
            botini oching va <span className="font-mono">/start</span> bosing.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-marigold text-xs font-bold text-ink">
            2
          </span>
          <span className="pt-0.5">Bot sizga 6 xonali bir martalik kod yuboradi.</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-marigold text-xs font-bold text-ink">
            3
          </span>
          <span className="pt-0.5">Shu kodni pastga kiriting — kod 1 daqiqa amal qiladi.</span>
        </li>
      </ol>

      <form onSubmit={submit} className="space-y-5">
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              aria-label={`Kod raqami ${i + 1}`}
              className="h-12 w-10 rounded-xl border-2 border-ink/20 bg-white text-center font-mono text-xl font-bold text-ink focus:border-ceramic"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={!complete || submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-marigold py-3.5 font-display text-sm text-ink shadow-tile transition hover:bg-marigold-dark disabled:opacity-40"
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
          Kodni tasdiqlash
        </button>
      </form>
    </div>
  );
}
