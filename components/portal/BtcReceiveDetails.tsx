"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import QRCode from "qrcode";

export default function BtcReceiveDetails({
  address,
  t,
}: {
  address: string;
  t: (key: string) => string;
}) {
  const [qrSrc, setQrSrc] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setQrSrc("");
    QRCode.toDataURL(`bitcoin:${address}`, {
      margin: 1,
      width: 192,
      errorCorrectionLevel: "M",
      color: { dark: "#1a1a1a", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setQrSrc(url);
      })
      .catch(() => {
        if (!cancelled) setQrSrc("");
      });
    return () => {
      cancelled = true;
    };
  }, [address]);

  useEffect(() => {
    setCopied(false);
  }, [address]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <div>
      <p className="font-body text-xs uppercase tracking-wide text-charcoal/50 mb-3">
        {t("portal.funding.btcAddress")}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {qrSrc ? (
          <img
            src={qrSrc}
            alt={t("portal.funding.btcQrAlt")}
            width={160}
            height={160}
            className="w-40 h-40 bg-white border border-charcoal/10 rounded-sm p-1 shrink-0"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm break-all text-charcoal bg-off-white p-3 rounded-sm select-all">
            {address}
          </p>
          <button
            type="button"
            onClick={copy}
            className="mt-2 inline-flex items-center gap-1.5 font-body text-xs text-charcoal/70 hover:text-charcoal"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? t("portal.funding.copiedAddress") : t("portal.funding.copyAddress")}
          </button>
        </div>
      </div>
      <p className="font-body text-xs text-charcoal/50 mt-3">{t("portal.funding.btcNote")}</p>
    </div>
  );
}
