"use client";

import type { LucideIcon } from "lucide-react";

type SettingsSectionProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
};

export default function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
}: SettingsSectionProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 text-violet-600 dark:text-violet-400">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {title}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-5 p-6">{children}</div>
    </section>
  );
}
