import "./globals.css";
import { CartProvider } from "../context/CartContext";
import HeaderNav from "../components/HeaderNav";

export const metadata = {
  title: "Hot Village — Order Food Online",
  description:
    "Order food online from Hot Village, Kot Radha Kishan. Fresh, fast, cash on delivery.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400..900;1,9..40,400..900&family=Noto+Nastaliq+Urdu:wght@400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>
          <div className="topbar">
            Home Delivery:{" "}
            <a href="tel:+923451132854">
              <strong>0345-1132854</strong>
            </a>{" "}
            · Minimum order Rs. 1000
          </div>

          <HeaderNav />

          <main>{children}</main>

          <footer className="site-footer" id="contact">
            <div className="foot-cols">
              <div className="foot-col">
                <h4>Find us</h4>
                <p>
                  Javaid Plaza, Opp. Azam Plaza,
                  <br />
                  Raiwind Road, Kot Radha Kishan
                </p>
              </div>
              <div className="foot-col">
                <h4>Call us</h4>
                <p>
                  <a href="tel:+923451112229">0345-1112229</a>
                  <br />
                  <a href="tel:+923451132845">0345-1132845</a>
                  <br />
                  <a href="tel:+923211132854">0321-1132854</a>
                </p>
              </div>
              <div className="foot-col">
                <h4>Opening hours</h4>
                <p>
                  Open Daily
                  <br />
                  12:00 PM – 12:00 AM
                </p>
              </div>
            </div>
            <div className="foot-bar">
              Hot Village Family Restaurant · Fastest in taste
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
