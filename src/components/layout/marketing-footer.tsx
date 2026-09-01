import Link from "next/link";
import { Logo } from "@/components/layout/logo";

const product = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/demo", label: "Demo report" },
];
const company = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login" },
];
const social = [
  { href: "https://www.linkedin.com", label: "LinkedIn" },
  { href: "https://x.com", label: "X" },
  { href: "https://www.youtube.com", label: "YouTube" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            AI-powered website audits that show business owners exactly what is limiting growth.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Product</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            {product.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">Company</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            {company.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">Social</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            {social.map((item) => (
              <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className="hover:text-foreground">
                {item.label}
              </a>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            <a href="mailto:hello@growthpilot.ai" className="hover:text-foreground">
              hello@growthpilot.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
