"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/site";

export function HeaderNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "關閉" : "選單"}
      </button>
      <nav className={`site-nav${open ? " is-open" : ""}`} aria-label="主要">
        {NAV.map((item, index) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <span key={item.href} className="nav-item">
              {index > 0 ? <span className="nav-dot" aria-hidden /> : null}
              <Link
                href={item.href}
                className={active ? "is-active" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </span>
          );
        })}
      </nav>
    </>
  );
}
