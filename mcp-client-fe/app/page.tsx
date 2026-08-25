"use client";
import ChatMessages from "@/components/ChatMessages/page";
import LangGraphTextBox from "@/components/LangGraphTextBox/page";
// import TextBox from "@/components/TextBox/page";
import { ChatMessagesProps } from "@/types/allTypes";
import { Bot, Sparkles, Zap } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [chat, setChat] = useState<ChatMessagesProps>({
    messages: [],
  });

  // useEffect(() => {
  //   console.log({ chat });
  // }, [chat]);
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[radial-gradient(circle_at_top_left,#d9f99d_0,transparent_28%),linear-gradient(135deg,#f8fafc_0%,#eef2ff_45%,#ecfeff_100%)] font-sans text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(132,204,22,0.18)_0,transparent_26%),linear-gradient(135deg,#020617_0%,#0f172a_48%,#082f49_100%)] dark:text-zinc-50">
      <main className="mx-auto flex h-[calc(100vh-73px)] min-h-0 w-full max-w-6xl flex-1 flex-col px-4 pb-36 pt-6 sm:px-6 lg:px-8">
        {chat.messages.length === 0 && (
          <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center py-12">
            <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-emerald-700 shadow-sm shadow-slate-200/80 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-emerald-300 dark:shadow-none">
              <Bot size={28} />
            </div>
            <div className="max-w-3xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                <Sparkles size={15} />
                MCP workspace ready
              </p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                Ask, connect, and run tools from one focused chat.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg dark:text-zinc-300">
                Start a conversation with your agent, use connected MCP tools,
                and keep the whole workflow in a clean command center.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-zinc-300">
              {["Inspect server tools", "Draft a workflow", "Summarize results"].map(
                (item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 shadow-sm shadow-slate-200/70 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:shadow-none"
                  >
                    <Zap size={14} className="text-amber-500" />
                    {item}
                  </div>
                ),
              )}
            </div>
          </section>
        )}
        {chat.messages.length > 0 && <ChatMessages messages={chat.messages} />}
        {/* <TextBox setChat={setChat} chat={chat} /> */}
        <LangGraphTextBox setChat={setChat} chat={chat} />
      </main>
    </div>
  );
}
