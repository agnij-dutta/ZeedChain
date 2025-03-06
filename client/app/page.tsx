"use client";

import WalletConnect from "@/components/WalletConnect";
import NFTInvestment from "@/components/NFTInvestment";
import GovernanceInterface from "@/components/GovernanceInterface";
import ProfitDistribution from "@/components/ProfitDistribution";
import { useState } from "react";
import { Playfair_Display } from "next/font/google";
import VantaBackground from "@/components/NetBackground";
import NoiseFilter from "@/components/filters/NoiseFilter";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <div className="absolute top-0 left-0 h-screen w-screen">
        <NoiseFilter />
        <div className="fixed top-0 left-0 h-full w-full z-0">
          <VantaBackground />
        </div>
        <div className="fixed inset-0 flex justify-center bg-black/40 z-20"></div>
        <div
          className="fixed inset-0 mix-blend-overlay z-30"
          style={{
            background: "#000",
            filter: "url(#noiseFilter)",
          }}
        ></div>
      </div>
      <div className="absolute z-50 h-full w-full top-0">
        <div className="hero flex items-center justify-center h-full w-full relative flex-col">
        </div>
        <div className="about flex items-center flex-col w-full">
        </div>
      </div>
    </>
  );
}
