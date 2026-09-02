import Link from "next/link";
import { LuArrowUpRight, LuCircle, LuSparkles } from "react-icons/lu";

import { HomeHeroLink } from "@/components/HomeHeroLink";
import { PreorderButton, PreorderPlasmaButton } from "@/components/Preorder";
import { AIR_TAGLINE } from "@/lib/air-copy";

export function Header() {
  return (
    <header className="site-header">
      <HomeHeroLink className="brand" />
      <nav aria-label="Primary navigation">
        <Link href="/how-it-works">how it works</Link>
        <Link className="nav-optional" href="/composable-computer">composable computer</Link>
        <Link className="nav-optional" href="/#mini-apps">mini apps</Link>
        <Link className="nav-optional" href="/#pricing">pricing</Link>
        <Link href="/docs">docs</Link>
        <PreorderPlasmaButton
          className="header-plasma-button"
          label="Try Air"
        />
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-lead">
          <HomeHeroLink className="brand footer-brand" />
          <p>{AIR_TAGLINE}</p>
          <PreorderButton className="footer-checkout" label="Start Air at $50 / month">
            <LuSparkles aria-hidden /> Start Air at $50 / month <LuArrowUpRight aria-hidden />
          </PreorderButton>
        </div>
        <nav className="footer-links" aria-label="Explore Air">
          <span>Explore</span>
          <a href="#top">Top</a>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/composable-computer">Composable computer</Link>
          <Link href="/capabilities">Capabilities</Link>
          <Link href="/docs">Docs</Link>
        </nav>
        <nav className="footer-links" aria-label="Air product navigation">
          <span>Product</span>
          <a href="/#agent-control-plane">iMessage control plane</a>
          <a href="/#mini-apps">Mini Apps</a>
          <a href="/#roadmap">Roadmap</a>
          <a href="/#pricing">Pricing</a>
        </nav>
        <div className="footer-meta">
          <span className="footer-status"><LuCircle aria-hidden /> Private beta / availability labeled</span>
          <a href="https://wzrd.tech" target="_blank" rel="noreferrer">WZRD.tech <LuArrowUpRight aria-hidden /></a>
          <span>air.wzrd.tech</span>
          <span>© {new Date().getFullYear()} 5DEE Studios</span>
        </div>
      </div>
    </footer>
  );
}
