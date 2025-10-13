"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-blue-950 border-t border-blue-800 mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo/Brand */}
          <div>
            <h3 className="text-white font-bold text-lg">WaveWatch</h3>
            <p className="text-blue-300 text-sm">Votre plateforme de streaming premium</p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link href="/requests" className="text-blue-300 hover:text-white transition-colors text-sm">
              Support
            </Link>
            <Link href="/changelogs" className="text-blue-300 hover:text-white transition-colors text-sm">
              Mise à jour
            </Link>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-6 pt-6 text-center">
          <p className="text-blue-300 text-sm">© {new Date().getFullYear()} WaveWatch. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
