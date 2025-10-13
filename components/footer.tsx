"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-blue-950 border-t border-blue-800 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">WaveWatch</h3>
            <p className="text-blue-300 text-sm">
              Votre plateforme de streaming premium pour films, séries, animés et bien plus encore.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/movies" className="text-blue-300 hover:text-white transition-colors text-sm">
                  Films
                </Link>
              </li>
              <li>
                <Link href="/tv-shows" className="text-blue-300 hover:text-white transition-colors text-sm">
                  Séries
                </Link>
              </li>
              <li>
                <Link href="/anime" className="text-blue-300 hover:text-white transition-colors text-sm">
                  Animés
                </Link>
              </li>
              <li>
                <Link href="/subscription" className="text-blue-300 hover:text-white transition-colors text-sm">
                  Devenir VIP
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/requests" className="text-blue-300 hover:text-white transition-colors text-sm">
                  Faire une demande
                </Link>
              </li>
              <li>
                <Link href="/changelogs" className="text-blue-300 hover:text-white transition-colors text-sm">
                  Nouveautés
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-blue-300 hover:text-white transition-colors text-sm">
                  Mon Profil
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Suivez-nous</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-blue-300 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-blue-300 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-blue-300 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-blue-300 hover:text-white transition-colors" aria-label="YouTube">
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@wavewatch.com"
                className="text-blue-300 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-8 text-center">
          <p className="text-blue-300 text-sm">© {new Date().getFullYear()} WaveWatch. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
