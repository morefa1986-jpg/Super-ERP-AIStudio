/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { QrCode, X, Printer, Download, ShieldCheck, CheckCircle2, Award, Calendar, Hash } from "lucide-react";
import { Pool } from "../types";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool?: Pool | null;
  citesBatch?: {
    permitNumber: string;
    species: string;
    weightKg: number;
    harvestDate: string;
    tinSerial: string;
  } | null;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  pool,
  citesBatch
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    let payloadString = "";
    if (pool) {
      payloadString = JSON.stringify({
        farm: "FATHI AQUA STURGEON FARM",
        type: "POOL_PASSPORT",
        poolId: pool.id,
        name: pool.name,
        breed: pool.breed,
        biomassKg: pool.totalBiomassKg,
        count: pool.count,
        citesPermit: pool.citesExportPermit || "CITES-PENDING-2026",
        timestamp: new Date().toISOString()
      });
    } else if (citesBatch) {
      payloadString = JSON.stringify({
        farm: "FATHI AQUA STURGEON FARM",
        type: "CITES_CAVIAR_EXPORT_TIN",
        permit: citesBatch.permitNumber,
        species: citesBatch.species,
        weightKg: citesBatch.weightKg,
        harvestDate: citesBatch.harvestDate,
        serial: citesBatch.tinSerial
      });
    } else {
      payloadString = JSON.stringify({ farm: "FATHI AQUA STURGEON FARM", type: "OFFLINE_LOCAL_ID", version: 1 });
    }

    QRCode.toDataURL(payloadString, {
      width: 280,
      margin: 2,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF"
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error("QR Code error:", err));
  }, [isOpen, pool, citesBatch]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md glass-card-3d border border-cyan-500/40 shadow-2xl bg-slate-950/95 rounded-3xl overflow-hidden text-white">
        
        {/* HEADER */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500 text-slate-950 rounded-xl font-black">
              <QrCode size={18} />
            </div>
            <h3 className="text-sm font-black font-sans">
              {pool ? "شناسنامه پویای QR Code استخر" : "گواهی دیجیتال CITES قوطی خاویار"}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* PRINTABLE CERTIFICATE CARD */}
        <div ref={printRef} className="p-6 text-center space-y-4 bg-white text-slate-900 printable-area">
          
          <div className="border-2 border-slate-900 p-4 rounded-2xl space-y-3">
            
            {/* BRAND HEADER */}
            <div className="flex items-center justify-between border-b pb-2">
              <div className="text-right">
                <h4 className="text-xs font-black text-slate-900">مزارع نوین پرورشی فتحی</h4>
                <span className="text-[9px] text-slate-500 block">FATHI AQUA CITES CERTIFIED</span>
              </div>
              <ShieldCheck size={24} className="text-emerald-700" />
            </div>

            {/* QR IMAGE */}
            {qrDataUrl ? (
              <div className="flex justify-center my-2">
                <img src={qrDataUrl} alt="QR Code" className="w-44 h-44 rounded-xl border border-slate-300 shadow-sm" />
              </div>
            ) : (
              <div className="w-44 h-44 mx-auto bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-xs text-slate-400">
                در حال تولید QR...
              </div>
            )}

            {/* DETAILS */}
            {pool && (
              <div className="text-xs text-right space-y-1 font-sans border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">نام/شناسه:</span>
                  <strong className="font-bold">{pool.name} ({pool.id})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">نژاد ماهیان:</span>
                  <strong className="font-bold">{pool.breed}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">تعداد / بیوماس:</span>
                  <strong className="font-bold">{pool.count} قطعه ({pool.totalBiomassKg} kg)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">مجوز CITES:</span>
                  <strong className="font-mono text-[10px] text-cyan-800">{pool.citesExportPermit || "CITES-EXP-2026-FATHI"}</strong>
                </div>
              </div>
            )}

            {citesBatch && (
              <div className="text-xs text-right space-y-1 font-sans border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">پروانه CITES:</span>
                  <strong className="font-mono text-xs text-cyan-800">{citesBatch.permitNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">گونه خاویار:</span>
                  <strong className="font-bold">{citesBatch.species}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">تاریخ استحصال:</span>
                  <strong className="font-bold">{citesBatch.harvestDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">سریال پلمپ:</span>
                  <strong className="font-mono text-[10px] text-emerald-800">{citesBatch.tinSerial}</strong>
                </div>
              </div>
            )}

            <div className="text-[8px] text-slate-400 font-mono text-center pt-1 border-t">
              VERIFIED BY CITES INTERNATIONAL STURGEON TRACEABILITY SYSTEM
            </div>

          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between no-print bg-slate-900/50">
          <a
            href={qrDataUrl}
            download={pool ? `QR_${pool.id}.png` : "CITES_QR.png"}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Download size={14} />
            ذخیره تصویر
          </a>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-500/30 cursor-pointer"
          >
            <Printer size={14} />
            چاپ برچسب
          </button>
        </div>

      </div>
    </div>
  );
};
