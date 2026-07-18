import React, { useState, useEffect } from "react";

interface SplashPreloaderProps {
  onComplete?: () => void;
}

export const SplashPreloader: React.FC<SplashPreloaderProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [typedTitle, setTypedTitle] = useState<string>("");
  const [hexText, setHexText] = useState<string>("CORE_AUTH // 0x8B91C4A0");
  const [progressWidth, setProgressWidth] = useState<number>(0);

  const fullTitle = "INVOICEX-RAY";

  // Typing effect for "INVOICEX-RAY" in Phase 1 (0.0s - 0.8s)
  useEffect(() => {
    let charIdx = 0;
    const typingInterval = setInterval(() => {
      if (charIdx <= fullTitle.length) {
        setTypedTitle(fullTitle.slice(0, charIdx));
        charIdx++;
      } else {
        clearInterval(typingInterval);
      }
    }, 55);

    return () => clearInterval(typingInterval);
  }, []);

  // Main Phase Timeline Orchestration
  useEffect(() => {
    // Phase 2 (0.8s): Subtext appears, progress bar scales 0% -> 100%
    const p2Timer = setTimeout(() => {
      setPhase(2);
      setProgressWidth(100);
    }, 800);

    // Phase 3 (1.8s): Cryptographic hex token cycling
    const p3Timer = setTimeout(() => {
      setPhase(3);
    }, 1800);

    // Phase 4 (2.6s): [ SYSTEM READY ] emerald static state
    const p4Timer = setTimeout(() => {
      setPhase(4);
    }, 2600);

    // Phase 5 (3.0s): Fade out overlay
    const p5Timer = setTimeout(() => {
      setPhase(5);
      if (onComplete) onComplete();
    }, 3000);

    return () => {
      clearTimeout(p2Timer);
      clearTimeout(p3Timer);
      clearTimeout(p4Timer);
      clearTimeout(p5Timer);
    };
  }, [onComplete]);

  // Phase 3 Cryptographic Hex Cycling (1.8s - 2.6s)
  useEffect(() => {
    if (phase !== 3) return;

    const hexTokens = [
      "CORE_AUTH // 0x8B91C4A0",
      "TBML_CIPHER // 0x4F1D90E2",
      "MCP_STREAM // 0x7E3A901F",
      "POLICY_SEAL // 0xD291C804",
      "HS_INDEX // 0x11A4F98E",
      "FEMA_INTEGRITY // 0x5D84A312",
    ];

    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % hexTokens.length;
      setHexText(hexTokens[idx]);
    }, 100);

    return () => clearInterval(interval);
  }, [phase]);

  if (phase === 5) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center font-mono transition-all duration-500 ease-out ${
        phase === 4
          ? "opacity-0 scale-105 pointer-events-none"
          : "opacity-100 scale-100"
      }`}
    >
      <div className="relative border border-zinc-900 bg-zinc-900/30 backdrop-blur-sm p-10 rounded-xl shadow-2xl min-w-[380px] text-center space-y-6 overflow-hidden">
        {/* Phase 1: Main Project Title */}
        <div className="space-y-2">
          <div className="text-xl font-bold tracking-widest text-zinc-100 uppercase font-mono min-h-[28px] flex items-center justify-center">
            <span>{typedTitle}</span>
            {typedTitle.length < fullTitle.length && (
              <span className="animate-ping text-red-500 font-normal ml-0.5">|</span>
            )}
          </div>
          <p className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase opacity-70">
            Trade Compliance Security Node
          </p>
        </div>

        {/* Phase 2 - 4: Subtext Status Area */}
        <div className="h-6 flex items-center justify-center font-mono">
          {phase === 1 && (
            <span className="text-xs text-zinc-500 tracking-wider">
              INITIALIZING...
            </span>
          )}

          {phase === 2 && (
            <span className="text-xs text-zinc-400 tracking-wider animate-pulse">
              SECURE NODE CONNECTING...
            </span>
          )}

          {phase === 3 && (
            <span className="text-xs text-zinc-300 font-semibold tracking-tight">
              {hexText}
            </span>
          )}

          {phase === 4 && (
            <span className="text-xs text-emerald-400 font-extrabold tracking-widest">
              [ SYSTEM READY ]
            </span>
          )}
        </div>

        {/* Phase 2: Single-Pixel Wide Horizontal Progress Line at Edge */}
        <div className="absolute bottom-0 left-0 right-0 w-full bg-zinc-900 h-[1px]">
          <div
            className="h-[1px] bg-emerald-500/90 transition-all duration-[1000ms] ease-in-out"
            style={{ width: `${progressWidth}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
