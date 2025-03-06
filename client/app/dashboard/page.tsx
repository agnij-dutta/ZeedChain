"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconBrandGithub,
  IconBrandX,
  IconExchange,
  IconHome,
  IconNewSection,
  IconTerminal2,
  IconSettings,
  IconCoins,
  IconUser,
  IconList,
} from "@tabler/icons-react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { Analytics } from "@/components/Analytics";
import { Stats } from "@/components/Stats";
import History from "@/components/HIstory";
import ProfileCard from "@/components/ProfileCard";
import { BarChartCard } from "@/components/BarChart";
const Dashboard = () => {
    const user = {
        name: 'Agnij Dutta',
        image: 'https://github.com/shadcn.png',
        username: 'shadcn'
    }
  const links = [
    {
      title: "Home",
      icon: (
        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "History",
      icon: (
        <IconList className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "Founder",
      icon: (
        <IconUser className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },

    {
      title: "Investor",
      icon: (
        <IconCoins className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "Settings",
      icon: (
        <IconSettings className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
  ];
  return (
    <div className="px-10 pt-8 pb-10 w-full h-[calc(100vh-56px)] absolute top-14">
      <div className="grid grid-cols-[20%_55%_25%] gap-2 h-full">
        <div className="grid grid-rows-[auto_1fr]">
          <ProfileCard user={user}/>    
          <Stats />
        </div>
        <div className="grid grid-rows-[1fr_auto]">
          <BarChartCard/>
          <Analytics />
        </div>
        <History />
      </div>
      <FloatingDock
        items={links}
        desktopClassName="absolute bottom-3 left-1/2 -translate-x-1/2 z-10"
      />
    </div>
  );
};

export default Dashboard;
