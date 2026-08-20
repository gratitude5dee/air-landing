import Image from "next/image";

import { PreorderButton } from "@/components/Preorder";

export function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Air by WZRD.tech home">
        <span>air by</span>
        <Image src="/images/wzrd-wordmark.png" alt="WZRD.tech" width={1600} height={396} priority />
      </a>
      <nav aria-label="Primary navigation">
        <a href="#how-it-works">how it works</a>
        <PreorderButton compact />
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <a className="brand footer-brand" href="#top" aria-label="Air by WZRD.tech home">
            <span>air by</span>
            <Image src="/images/wzrd-wordmark.png" alt="WZRD.tech" width={1600} height={396} />
          </a>
          <p>Your personal creative assistant in your iMessages.</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#top">Top</a>
          <a href="#how-it-works">How it works</a>
          <a href="https://wzrd.tech" target="_blank" rel="noreferrer">WZRD.tech ↗</a>
        </nav>
        <div className="footer-meta">
          <span>air.wzrd.tech</span>
          <span>© {new Date().getFullYear()} 5DEE Studios</span>
        </div>
      </div>
    </footer>
  );
}
