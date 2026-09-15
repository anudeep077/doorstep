"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { cameFromHome } from "@/lib/scroll-memory";

/**
 * Link to "/" that goes *back* in history when the user arrived from the
 * feed, so the browser returns them to the same scroll position instead of
 * pushing a fresh copy of the home page at the top. Direct visitors (no
 * in-app history) get a normal navigation.
 */
export function BackToHome(props: Omit<ComponentProps<typeof Link>, "href" | "onClick">) {
  const router = useRouter();
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let new-tab clicks through
    if (!cameFromHome()) return;
    e.preventDefault();
    router.back();
  };
  return <Link href="/" onClick={onClick} {...props} />;
}
