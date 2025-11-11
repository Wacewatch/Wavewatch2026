import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import Script from "next/script" // Import du composant Script

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WaveWatch - Plateforme de Streaming Premium",
  description:
    "Découvrez et streamez des milliers de films, séries TV, animés et contenus exclusifs en haute qualité sur WaveWatch",
  keywords: "streaming, films, séries, animés, WaveWatch, plateforme streaming, contenu premium",
  authors: [{ name: "WaveWatch Team" }],
  creator: "WaveWatch",
  publisher: "WaveWatch",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  generator: "WaveWatch Platform",
  openGraph: {
    title: "WaveWatch - Plateforme de Streaming Premium",
    description: "Découvrez et streamez des milliers de films, séries TV, animés et contenus exclusifs",
    type: "website",
    locale: "fr_FR",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="ocean" defaultMode="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <Navigation />
            <main className="min-h-screen bg-background">{children}</main>
            <Footer />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>

        {/* Script Ahrefs Analytics */}
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="H7U+kFL0zyofiO02zN/tSg"
          strategy="afterInteractive"
          async
        />

        {/* Compteur Histats caché */}
        <div style={{ display: "none" }}>
          <a href="/" target="_blank" rel="noreferrer">
            <img src="https://sstatic1.histats.com/0.gif?4986671&101" alt="web hit counter" border={0} />
          </a>
        </div>
      </body>
    </html>
  )
}
