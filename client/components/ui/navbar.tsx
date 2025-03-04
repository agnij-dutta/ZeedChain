"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
const NavBar = () => {
  const links = [
    { name: "Home", href: "/", searchHref: "/" },
    { name: "Project", href: "/project", searchHref: "/project" },
    { name: "Explore", href: "/explore", searchHref: "/explore" },
  ];
  const currentPath = usePathname();
  const isActive = (itemLink: string) => {
    // Exact match for root, starts with for other paths
    return itemLink === "/"
      ? currentPath === itemLink
      : currentPath.startsWith(itemLink) || currentPath === itemLink;
  };

  return (
    <header className="border-grid sticky top-0 z-50 w-full border-b border-dashed bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-wrapper">
        <div className="container flex h-14 items-center gap-2 justify-between px-5 md:gap-4 ">
          <a href="/">
            <img src="/images/icon.png" className="w-8 h-8" alt="Logo" />
          </a>
          <nav className="flex items-center gap-7">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                scroll={false}
                className={`
              text-l font-light
              ${
                isActive(item.searchHref)
                  ? "text-stone-100"
                  : "text-stone-400 hover:text-stone-200"
              }
            `}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
