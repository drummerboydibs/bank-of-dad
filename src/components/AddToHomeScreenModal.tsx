import { useState, type ReactNode } from "react";
import { Modal } from "./ui";

type Platform = "ios" | "android";

/** True when the app is already running as an installed PWA (no browser UI). */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari exposes this non-standard flag instead of display-mode.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Best-effort guess so we can show the most relevant steps first. */
function guessPlatform(): Platform {
  if (typeof navigator === "undefined") return "ios";
  const ua = navigator.userAgent || "";
  // iPadOS 13+ reports as "Macintosh" but is touch-capable.
  const iOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && "ontouchend" in document);
  return iOS ? "ios" : "android";
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-700 text-xs font-bold text-white"
      >
        {n}
      </span>
      <span className="text-sm leading-relaxed text-slate-700">{children}</span>
    </li>
  );
}

const tabBase =
  "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700";

export function AddToHomeScreenModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [platform, setPlatform] = useState<Platform>(guessPlatform);

  return (
    <Modal open={open} onClose={onClose} title="Add to Home Screen">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Install Bank of Dad like an app so it opens full-screen from your home screen — no browser
          bar, and just one tap to get in.
        </p>

        <div
          role="tablist"
          aria-label="Choose your device"
          className="flex gap-2 rounded-xl bg-slate-100 p-1"
        >
          <button
            role="tab"
            aria-selected={platform === "ios"}
            className={`${tabBase} ${platform === "ios" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
            onClick={() => setPlatform("ios")}
          >
            iPhone / iPad
          </button>
          <button
            role="tab"
            aria-selected={platform === "android"}
            className={`${tabBase} ${platform === "android" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
            onClick={() => setPlatform("android")}
          >
            Android
          </button>
        </div>

        {platform === "ios" ? (
          <ol className="space-y-3">
            <Step n={1}>
              Open this site in <strong>Safari</strong> (it won't work from Chrome on iPhone).
            </Step>
            <Step n={2}>
              Tap the <strong>Share</strong> button{" "}
              <span aria-hidden="true">⬆️</span> at the bottom of the screen.
            </Step>
            <Step n={3}>
              Scroll down and tap <strong>Add to Home Screen</strong>.
            </Step>
            <Step n={4}>
              Tap <strong>Add</strong> in the top corner. Look for the piggy bank icon on your home
              screen!
            </Step>
          </ol>
        ) : (
          <ol className="space-y-3">
            <Step n={1}>
              Open this site in <strong>Chrome</strong>.
            </Step>
            <Step n={2}>
              Tap the <strong>⋮</strong> menu (three dots) in the top-right corner.
            </Step>
            <Step n={3}>
              Tap <strong>Add to Home screen</strong> (or <strong>Install app</strong>).
            </Step>
            <Step n={4}>
              Tap <strong>Add</strong> / <strong>Install</strong> to confirm. Look for the piggy bank
              icon on your home screen!
            </Step>
          </ol>
        )}

        <button className="btn btn-primary w-full" onClick={onClose}>
          Got it
        </button>
      </div>
    </Modal>
  );
}
