import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { BottomNav } from "@/components/bottom-nav";
import { CartBar } from "@/components/cart-bar";
import { OrderSplash } from "@/components/order-splash";
import { ScrollReset } from "@/components/scroll-reset";
import { SCROLLER_ID } from "@/lib/scroller";
import { CartProvider } from "@/lib/cart";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Doorstep — food delivery",
  description: "Food delivered to your doorstep.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#121110" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Applies the saved theme before first paint — see src/lib/theme.ts */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="h-[100dvh] overflow-hidden">
        <CartProvider>
          {/* The "phone": a max-width column that owns scrolling, so the
              scrollbar and sticky headers belong to it, not the window. */}
          <div
            id={SCROLLER_ID}
            className="mx-auto flex h-full w-full max-w-md flex-col overflow-y-auto overscroll-y-contain border-line sm:border-x"
          >
            <ScrollReset />
            {children}
          </div>
          <CartBar />
          <BottomNav />
          <OrderSplash />
        </CartProvider>
      </body>
    </html>
  );
}
