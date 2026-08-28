"use client";
import { useSettingsStore } from "@/store/settings";
import { Home, Settings, Wifi, WifiOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

const Navbar = () => {
  const { model, mcpStatus, setMcpStatus } = useSettingsStore();
  const pathname = usePathname();
  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/Settings", label: "Settings", icon: Settings },
  ];

  useEffect(() => {
    const backendHealth = async () => {
      const response = await fetch("/api/health", {
        cache: "no-store",
      });
      if (!response.ok) {
        setMcpStatus(false);
      }
    };
    backendHealth();
    const interval = setInterval(backendHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75">
      <div className="mx-auto flex min-h-[72px] w-full max-w-6xl items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/80 dark:border-white/10 dark:bg-white/10 dark:shadow-none">
            <Image src={"/logo.png"} alt="MCP Client" width={28} height={28} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase text-emerald-700 dark:text-emerald-300">
              MCP Client
            </p>
            <h1 className="truncate text-base font-semibold leading-6 tracking-tight text-slate-950 sm:text-lg dark:text-zinc-50">
              {model || "Select a model"}
            </h1>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {mcpStatus ? (
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 md:flex dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
              <Wifi size={15} />
              Ready
            </div>
          ) : (
            <div className="hidden items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 md:flex dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200">
              <WifiOff size={15} /> Ready
            </div>
          )}
          <nav className="flex items-center rounded-full border border-slate-200 bg-slate-100/80 p-1 shadow-sm shadow-slate-200/70 dark:border-white/10 dark:bg-white/10 dark:shadow-none">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition sm:px-4 ${
                    isActive
                      ? "bg-white text-slate-950 shadow-sm dark:bg-white dark:text-slate-950"
                      : "text-slate-600 hover:text-slate-950 dark:text-zinc-300 dark:hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

{
  /* <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
 Looking for a starting point or more instructions? Head over to{" "}
 </p> */
}
