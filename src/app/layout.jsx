import Providers from "./providers.jsx";
import "./globals.css";

export const metadata = {
  title: { default: "Doctor Tracker", template: "%s · Doctor Tracker" },
  description: "Administrative portal for managing doctors and patients.",
  robots: { index: false, follow: false },
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#0f766e" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
