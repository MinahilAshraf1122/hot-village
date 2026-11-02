"use client";

import { useState } from "react";
import Link from "next/link";

// The Hot Village flame mark (amber outer flame, red inner flame),
// drawn as SVG so it stays crisp at any size.
function FlameLogo() {
  return (
    <svg
      className="brand-flame"
      viewBox="0 0 44 52"
      width="30"
      height="36"
      aria-hidden="true"
    >
      <path
        d="M22 2c2 8 12 12 12 24a12 12 0 0 1-24 0c0-6 3-9 5-12 0 4 2 6 4 6 0-8-2-12 3-18z"
        fill="#FFB400"
      />
      <path
        d="M22 20c1 5 6 7 6 13a6 6 0 0 1-12 0c0-4 3-6 4-8 1 2 2 2 2 0z"
        fill="#C8141B"
      />
    </svg>
  );
}

// Site header. On wide screens the nav links sit in a row; on mobile
// they hide behind the 3-line (hamburger) button and open as a panel
// when it is tapped. Tapping any link closes the panel again.
export default function HeaderNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" onClick={close}>
          <FlameLogo />
          <span className="brand-name">HOT VILLAGE</span>
        </Link>

        <button
          className="hamburger"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={"main-nav" + (open ? " open" : "")}>
          <Link href="/" onClick={close}>
            Home
          </Link>
          <Link href="/#menu" onClick={close}>
            Menu
          </Link>
          <Link href="/#deals" onClick={close}>
            Deals
          </Link>
          <Link href="/#contact" onClick={close}>
            Contact
          </Link>
          <Link href="/track" onClick={close}>
            Track Order
          </Link>
          <Link href="/#menu" className="btn nav-order" onClick={close}>
            Order Now
          </Link>
        </nav>
      </div>
    </header>
  );
}
