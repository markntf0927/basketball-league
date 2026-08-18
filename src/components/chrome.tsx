import Link from "next/link";
import { HeaderNav } from "@/components/header-nav";
import { NAV, SITE_NAME, SITE_NAME_EN } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden>
            鳳
          </span>
          <span>
            <span className="brand-zh">{SITE_NAME}</span>
            <span className="brand-en">{SITE_NAME_EN}</span>
          </span>
        </Link>
        <HeaderNav />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <p className="brand-zh">{SITE_NAME}</p>
          <p className="footer-tagline">荃葵九 · 屯天元 · 九龍區 · {SITE_NAME_EN}</p>
        </div>
        <div className="footer-links">
          {NAV.slice(0, 4).map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link href="/rules">賽務規章</Link>
          <a href="https://www.youtube.com/@phoenixbl2842" rel="noreferrer">
            最新影片
          </a>
          <a href="https://wa.me/85292335681">WhatsApp 92335681</a>
        </div>
        <p className="footer-copy">© PHOENIX BASKETBALL LEAGUE</p>
      </div>
    </footer>
  );
}

function HeadingRow({
  en,
  zh,
  enTag: EnTag,
}: {
  en: string;
  zh: string;
  enTag: "h1" | "h2";
}) {
  const ZhTag = EnTag === "h1" ? "p" : "h3";
  return (
    <>
      <EnTag className="section-en">{en}</EnTag>
      <ZhTag className="section-zh">{zh}</ZhTag>
    </>
  );
}

export function PageHeading({ en, zh }: { en: string; zh: string }) {
  return (
    <header className="section-head page-head">
      <HeadingRow en={en} zh={zh} enTag="h1" />
    </header>
  );
}

export function SectionHeading({
  en,
  zh,
  href,
}: {
  en: string;
  zh: string;
  href?: string;
  action?: string;
}) {
  const row = <HeadingRow en={en} zh={zh} enTag="h2" />;
  const className = "section-head";

  if (!href) {
    return <div className={className}>{row}</div>;
  }

  if (href.startsWith("http")) {
    return (
      <a className={className} href={href} rel="noreferrer">
        {row}
      </a>
    );
  }

  return (
    <Link className={className} href={href}>
      {row}
    </Link>
  );
}

export function SectionTabs({
  items,
}: {
  items: { label: string; href?: string; active?: boolean }[];
}) {
  return (
    <div className="section-tabs" role="tablist">
      {items.map((item) => {
        const className = `section-tab${item.active ? " is-active" : ""}`;
        if (item.href) {
          return (
            <Link key={item.label} href={item.href} className={className}>
              {item.label}
            </Link>
          );
        }
        return (
          <span key={item.label} className={className}>
            {item.label}
          </span>
        );
      })}
    </div>
  );
}
