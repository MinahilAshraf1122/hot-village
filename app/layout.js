import "./globals.css";
import Link from "next/link";
import { CartProvider } from "../context/CartContext";

export const metadata = {
  title: "Hot Village — Order Food Online",
  description:
    "Order food online from Hot Village, Kot Radha Kishan. Fresh, fast, cash on delivery.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <header className="site-header">
            <Link href="/" className="brand">
              <img src="/logo.png" alt="Hot Village logo" className="brand-logo" />
              <span>
                Hot <span className="brand-red">Village</span>
              </span>
            </Link>
            <nav>
              <Link href="/track">Track Order</Link>
            </nav>
          </header>
          <main>{children}</main>
          <footer className="site-footer">
            <div className="foot-brand">
              Hot <span>Village</span> — Family Restaurant
            </div>
            <div className="foot-tag">Fastest in Taste</div>
            <div className="foot-line">
              Javaid Plaza, Opp. Azam Plaza, Raiwind Road, Kot Radha Kishan
            </div>
            <div className="foot-line">
              Home Delivery: <strong>0345-1132854</strong> · Minimum Order:{" "}
              <strong>Rs 1000</strong>
            </div>
            <div>Cash on Delivery / Pickup</div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
