import type { Metadata } from "next";
import { Chakra_Petch, Dela_Gothic_One, Noto_Sans_JP } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/chrome";
import { SITE_NAME, SITE_NAME_EN } from "@/lib/site";
import "./globals.css";

const display = Dela_Gothic_One({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const sans = Noto_Sans_JP({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const score = Chakra_Petch({
  variable: "--font-score",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} · ${SITE_NAME_EN}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: "鳳凰籃球聯賽：荃葵九、屯天元組別賽程、球隊、排行榜與球員數據。",
};

export default async function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant-HK"
      className={`${display.variable} ${sans.variable} ${score.variable} h-full`}
    >
      <body>
        <div className="shell">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
