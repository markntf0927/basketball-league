import { PageHeading } from "@/components/chrome";
import { getPage } from "@/lib/queries";

export const metadata = { title: "聯絡我們" };

export default async function ContactPage() {
  const page = await getPage("contact");

  return (
    <>
      <PageHeading en="Contact" zh="聯絡我們" />
      <div className="contact-grid">
        <article className="prose-panel">
          {page?.body ??
            "WhatsApp：92335681\n電郵：phoenix.basketball.league@gmail.com"}
        </article>
        <form action="mailto:phoenix.basketball.league@gmail.com" method="get">
          <input name="subject" placeholder="主題" required />
          <input type="email" name="cc" placeholder="你的電郵" />
          <textarea name="body" rows={7} placeholder="訊息" required />
          <button type="submit">以電郵送出</button>
        </form>
      </div>
    </>
  );
}
