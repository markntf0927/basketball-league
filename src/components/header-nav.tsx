"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/site";

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav" aria-label="主要">
      {NAV.map((item, index) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <span key={item.href} className="nav-item">
            {index > 0 ? <span className="nav-dot" aria-hidden /> : null}
            <Link href={item.href} className={active ? "is-active" : undefined}>
              {item.label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
