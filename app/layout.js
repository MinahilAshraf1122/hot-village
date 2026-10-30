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
              🍽️ Hot Village
            </Link>
            <nav>
              <Link href="/track">Track Order</Link>
            </nav>
          </header>
          <main>{children}</main>
          <footer className="site-footer">
            Hot Village · Kot Radha Kishan · Cash on Delivery / Pickup
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
