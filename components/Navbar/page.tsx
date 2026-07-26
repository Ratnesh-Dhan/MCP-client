import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <div className="border px-5">
      <div className="flex justify-between items-center gap-6 text-center sm:items-start sm:text-left">
        <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
          Agent
        </h1>
        <div className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          <Link className="mr-2 md:mr-4" href="/">
            Home
          </Link>
          <Link href="/settings">Settings</Link>
        </div>
        {/* <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
         Looking for a starting point or more instructions? Head over to{" "}
         </p> */}
      </div>
    </div>
  );
};

export default Navbar;
