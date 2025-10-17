"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer
      className="border-t mt-20"
      style={{ backgroundColor: "hsl(var(--nav-bg))", borderColor: "hsl(var(--nav-border))" }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo/Brand */}
          <div>
            <h3 className="font-bold text-lg" style={{ color: "hsl(var(--nav-text))" }}>
              WaveWatch
            </h3>
            <p className="text-sm" style={{ color: "hsl(var(--nav-text-secondary))" }}>
              Votre plateforme de streaming premium
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/changelogs"
              className="transition-colors text-sm"
              style={{ color: "hsl(var(--nav-text-secondary))" }}
            >
              Mise à jour
            </Link>
          </div>
        </div>

        <div className="border-t mt-6 pt-6 text-center" style={{ borderColor: "hsl(var(--nav-border))" }}>
          <p className="text-sm" style={{ color: "hsl(var(--nav-text-secondary))" }}>
            © {new Date().getFullYear()} WaveWatch. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
