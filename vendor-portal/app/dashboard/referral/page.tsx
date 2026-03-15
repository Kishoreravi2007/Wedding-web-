"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

export default function ReferralLinkPage() {
  const [refCode, setRefCode] = useState("VEND123");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("vendors").select("referral_code").eq("id", user.id).single()
          .then(({ data }) => {
            if (data?.referral_code) setRefCode(data.referral_code);
          });
      }
    });
  }, []);

  const referralUrl = `weddingweb.in/register?vendor=${refCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Header title="Referral Link" />
      
      <div className="p-8 flex flex-col gap-8 max-w-4xl mx-auto w-full">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
          <div className="p-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Grow your business with commissions</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Share your exclusive referral link with other vendors and earn rewards for every successful registration.</p>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Your Referral link</label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
                    {referralUrl}
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2 shrink-0"
                  >
                    <span className="material-symbols-outlined text-lg">{copied ? "check" : "content_copy"}</span>
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
                  <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wider">Total Referrals</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">24</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-xs text-primary font-bold uppercase tracking-wider">Earnings</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹12,400</p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="size-40 bg-slate-100 rounded flex items-center justify-center text-slate-300">
                  <span className="material-symbols-outlined text-6xl">qr_code_2</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center">Scan this code to quickly share your link</p>
              <button className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                Download QR Code
                <span className="material-symbols-outlined text-sm">download</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-primary/5 rounded-xl p-8 border border-primary/10">
          <h4 className="font-bold text-slate-900 dark:text-white mb-4">How it works?</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">1</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Share your link with potential vendors or partners.</p>
            </div>
            <div className="flex gap-4">
              <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">2</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">They register their account using your unique code.</p>
            </div>
            <div className="flex gap-4">
              <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">3</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Earn up to 10% commission on their first annual plan.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
