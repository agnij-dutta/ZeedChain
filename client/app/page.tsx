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
        <div className="fixed top-0 left-0 z-50 h-full w-full z-0">
          <VantaBackground />
        </div>
        <div className="fixed  inset-0 flex  justify-center bg-black/40 z-20"></div>

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
          <h1 className={`text-5xl font-bold text-white`}>
            Innovate. Build. Invest.
          </h1>
          <p className={`text-[1rem]`}>
            with
            <span className={`${playfair.className} text-[2rem]`}>
              {" "}
              ZeedChain
            </span>
          </p>
          <div className="mt-2">
            <Button className="backdrop-blur-lg bg-white/10 rounded-full p-5 py-6 text-neutral-300 text-lg hover:bg-white/10 hover:border hover:border-neutral-300/40">
              Get Started <ChevronRight />
            </Button>
          </div>
        </div>{" "}
        <div className="about flex items-center flex-col w-full">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600 bg-clip-text text-transparent">what we do?</h1>
        </div>
      </div>
    </>
  );
}
