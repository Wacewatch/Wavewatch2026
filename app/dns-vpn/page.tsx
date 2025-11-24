import { Shield, Globe, Lock, CheckCircle, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DnsVpnPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-3">DNS & VPN</h1>
        <p className="text-gray-400 text-lg">
          Protégez votre vie privée en ligne avec un DNS sécurisé et un VPN gratuit
        </p>
      </div>

      {/* DNS Section */}
      <Card className="bg-gray-800 border-gray-700 mb-8">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-8 h-8 text-blue-400" />
            <CardTitle className="text-2xl text-white">DNS Cloudflare 1.1.1.1</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Un DNS rapide, sécurisé et respectueux de votre vie privée
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Pourquoi utiliser 1.1.1.1 ?</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Plus rapide :</strong> L'un des DNS les plus rapides au monde
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Sécurisé :</strong> Protection contre les sites malveillants
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Privé :</strong> Cloudflare ne vend pas vos données de navigation
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Gratuit :</strong> 100% gratuit, sans publicité
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Configuration sur Windows 11</h3>
            <ol className="space-y-4 text-gray-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <strong className="text-white">Ouvrez les Paramètres Windows</strong>
                  <p className="text-sm text-gray-400 mt-1">Appuyez sur <kbd className="bg-gray-800 px-2 py-1 rounded text-xs">Win + I</kbd> ou cherchez "Paramètres" dans le menu Démarrer</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <strong className="text-white">Accédez aux paramètres réseau</strong>
                  <p className="text-sm text-gray-400 mt-1">Cliquez sur <strong>Réseau et Internet</strong> dans le menu de gauche</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <strong className="text-white">Trouvez votre connexion</strong>
                  <p className="text-sm text-gray-400 mt-1">Cliquez sur <strong>Wi-Fi</strong> ou <strong>Ethernet</strong> selon votre type de connexion</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <div>
                  <strong className="text-white">Modifiez les paramètres DNS</strong>
                  <p className="text-sm text-gray-400 mt-1">Cliquez sur votre connexion active, puis sur le bouton <strong>Modifier</strong> à côté de "Attribution du serveur DNS"</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                <div>
                  <strong className="text-white">Configurez les DNS</strong>
                  <p className="text-sm text-gray-400 mt-1">Sélectionnez <strong>Manuel</strong> et activez <strong>IPv4</strong></p>
                  <div className="bg-gray-800 p-4 rounded mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm w-32">DNS préféré :</span>
                      <code className="font-mono text-blue-400 font-semibold">1.1.1.1</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm w-32">DNS auxiliaire :</span>
                      <code className="font-mono text-blue-400 font-semibold">1.0.0.1</code>
                    </div>
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">6</span>
                <div>
                  <strong className="text-white">Enregistrez les modifications</strong>
                  <p className="text-sm text-gray-400 mt-1">Cliquez sur <strong>Enregistrer</strong> et fermez la fenêtre. Votre DNS est maintenant configuré !</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Configuration sur macOS</h3>
            <ol className="space-y-4 text-gray-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <strong className="text-white">Ouvrez les Réglages Système</strong>
                  <p className="text-sm text-gray-400 mt-1">Cliquez sur le menu  (Pomme) en haut à gauche, puis sur <strong>Réglages Système</strong></p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <strong className="text-white">Accédez au réseau</strong>
                  <p className="text-sm text-gray-400 mt-1">Cliquez sur <strong>Réseau</strong> dans la barre latérale</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <strong className="text-white">Sélectionnez votre connexion</strong>
                  <p className="text-sm text-gray-400 mt-1">Cliquez sur <strong>Wi-Fi</strong> ou <strong>Ethernet</strong> selon votre connexion active</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <div>
                  <strong className="text-white">Accédez aux paramètres DNS</strong>
                  <p className="text-sm text-gray-400 mt-1">Cliquez sur <strong>Détails...</strong> puis sur l'onglet <strong>DNS</strong></p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                <div>
                  <strong className="text-white">Ajoutez les serveurs DNS</strong>
                  <p className="text-sm text-gray-400 mt-1">Cliquez sur le bouton <strong>+</strong> sous la liste des serveurs DNS et ajoutez :</p>
                  <div className="bg-gray-800 p-4 rounded mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Serveur 1 :</span>
                      <code className="font-mono text-blue-400 font-semibold">1.1.1.1</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Serveur 2 :</span>
                      <code className="font-mono text-blue-400 font-semibold">1.0.0.1</code>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">💡 Appuyez sur <kbd className="bg-gray-800 px-2 py-1 rounded text-xs">Entrée</kbd> après chaque adresse</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">6</span>
                <div>
                  <strong className="text-white">Enregistrez les modifications</strong>
                  <p className="text-sm text-gray-400 mt-1">Cliquez sur <strong>OK</strong> pour valider. Votre DNS est configuré !</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Configuration sur Android</h3>
            <ol className="space-y-4 text-gray-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <strong className="text-white">Ouvrez les Paramètres</strong>
                  <p className="text-sm text-gray-400 mt-1">Appuyez sur l'icône <strong>Paramètres</strong> (roue dentée) de votre téléphone</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <strong className="text-white">Accédez aux paramètres réseau</strong>
                  <p className="text-sm text-gray-400 mt-1">Appuyez sur <strong>Réseau et Internet</strong> ou <strong>Connexions</strong></p>
                  <p className="text-xs text-gray-500 mt-1">Note : Le nom peut varier selon la marque de votre téléphone</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <strong className="text-white">Trouvez l'option DNS privé</strong>
                  <p className="text-sm text-gray-400 mt-1">Cherchez et appuyez sur <strong>DNS privé</strong> ou <strong>Private DNS</strong></p>
                  <p className="text-xs text-gray-500 mt-1">💡 Si vous ne trouvez pas cette option, elle peut être dans "Plus de paramètres de connexion"</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <div>
                  <strong className="text-white">Configurez le DNS</strong>
                  <p className="text-sm text-gray-400 mt-1">Sélectionnez <strong>Nom d'hôte du fournisseur DNS privé</strong></p>
                  <div className="bg-gray-800 p-4 rounded mt-3">
                    <p className="text-gray-400 text-sm mb-2">Entrez exactement :</p>
                    <code className="font-mono text-blue-400 font-semibold text-sm break-all">1dot1dot1dot1.cloudflare-dns.com</code>
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                <div>
                  <strong className="text-white">Enregistrez</strong>
                  <p className="text-sm text-gray-400 mt-1">Appuyez sur <strong>Enregistrer</strong>. Votre Android utilise maintenant le DNS Cloudflare !</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Configuration sur iOS (iPhone/iPad)</h3>
            <p className="text-gray-400 text-sm mb-4">
              Sur iOS, le moyen le plus simple est d'utiliser l'application officielle de Cloudflare :
            </p>
            <ol className="space-y-4 text-gray-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <strong className="text-white">Téléchargez l'application</strong>
                  <p className="text-sm text-gray-400 mt-1">Ouvrez l'<strong>App Store</strong> et recherchez <strong>1.1.1.1: Faster Internet</strong></p>
                  <p className="text-xs text-gray-500 mt-1">🔍 C'est l'application officielle de Cloudflare (logo bleu et blanc)</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <strong className="text-white">Installez et ouvrez l'app</strong>
                  <p className="text-sm text-gray-400 mt-1">Téléchargez l'application gratuitement et ouvrez-la</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <strong className="text-white">Activez le DNS</strong>
                  <p className="text-sm text-gray-400 mt-1">Appuyez sur le gros bouton au centre de l'écran pour activer 1.1.1.1</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <div>
                  <strong className="text-white">Autorisez la configuration VPN</strong>
                  <p className="text-sm text-gray-400 mt-1">iOS vous demandera d'autoriser l'ajout d'une configuration VPN. Appuyez sur <strong>Autoriser</strong></p>
                  <p className="text-xs text-gray-500 mt-1">💡 Ne vous inquiétez pas : cela permet juste au DNS de fonctionner, ce n'est pas un VPN complet</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                <div>
                  <strong className="text-white">C'est terminé !</strong>
                  <p className="text-sm text-gray-400 mt-1">Quand le bouton est bleu, votre iPhone utilise le DNS sécurisé de Cloudflare</p>
                </div>
              </li>
            </ol>
          </div>

          <Button asChild className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
            <a href="https://1.1.1.1/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              En savoir plus sur 1.1.1.1
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* VPN Section */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-8 h-8 text-purple-400" />
            <CardTitle className="text-2xl text-white">Proton VPN</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Un VPN gratuit, sécurisé et sans limite de données
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Pourquoi utiliser Proton VPN ?</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Gratuit :</strong> Version gratuite sans limite de données
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Sécurisé :</strong> Chiffrement de niveau militaire
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Sans logs :</strong> Aucun enregistrement de votre activité
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Open Source :</strong> Code source auditable publiquement
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Basé en Suisse :</strong> Protection par les lois suisses sur la vie privée
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Installation et configuration</h3>
            <ol className="space-y-4 text-gray-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <strong className="text-white">Créez un compte gratuit</strong>
                  <p className="text-sm text-gray-400 mt-1">
                    Rendez-vous sur{" "}
                    <a
                      href="https://protonvpn.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      protonvpn.com
                    </a>{" "}
                    et cliquez sur <strong>Get Proton VPN Free</strong>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">✅ Aucune carte bancaire n'est requise pour le compte gratuit</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <strong className="text-white">Remplissez le formulaire</strong>
                  <p className="text-sm text-gray-400 mt-1">Entrez une adresse email et créez un mot de passe sécurisé</p>
                  <p className="text-xs text-gray-500 mt-1">💡 Vous pouvez utiliser n'importe quelle adresse email</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <strong className="text-white">Téléchargez l'application</strong>
                  <p className="text-sm text-gray-400 mt-1">Choisissez votre système d'exploitation :</p>
                  <div className="bg-gray-800 p-3 rounded mt-2 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">💻</span>
                      <span>Windows, macOS ou Linux</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">📱</span>
                      <span>Android (Google Play) ou iOS (App Store)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">🌐</span>
                      <span>Extension navigateur (Chrome, Firefox, Edge)</span>
                    </div>
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <div>
                  <strong className="text-white">Installez l'application</strong>
                  <p className="text-sm text-gray-400 mt-1">Suivez les instructions d'installation habituelles pour votre système</p>
                  <p className="text-xs text-gray-500 mt-1">Sur Windows : Exécutez le fichier .exe / Sur Mac : Ouvrez le fichier .dmg</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                <div>
                  <strong className="text-white">Connectez-vous</strong>
                  <p className="text-sm text-gray-400 mt-1">Ouvrez l'application et entrez l'email et le mot de passe que vous avez créés</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">6</span>
                <div>
                  <strong className="text-white">Connectez-vous au VPN</strong>
                  <p className="text-sm text-gray-400 mt-1">Cliquez sur le bouton <strong>Quick Connect</strong> (Connexion rapide)</p>
                  <p className="text-xs text-gray-500 mt-1">🚀 L'application choisira automatiquement le serveur le plus rapide pour vous</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold">✓</span>
                <div>
                  <strong className="text-white">Vous êtes protégé !</strong>
                  <p className="text-sm text-gray-400 mt-1">Quand vous voyez "Connecté" en vert, votre connexion est sécurisée et votre IP est masquée</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white mb-1">Version gratuite vs Premium</h4>
                <p className="text-gray-300 text-sm">
                  La version gratuite offre un accès à 3 pays et une vitesse moyenne. Pour plus de serveurs, une vitesse
                  maximale et des fonctionnalités avancées, vous pouvez passer à la version Premium.
                </p>
              </div>
            </div>
          </div>

          <Button asChild className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
            <a
              href="https://protonvpn.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Télécharger Proton VPN
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 mt-8">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-white mb-2">Pourquoi combiner DNS et VPN ?</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Utiliser un DNS sécurisé comme 1.1.1.1 améliore la vitesse et la sécurité de vos requêtes DNS, tandis
                qu'un VPN comme Proton VPN chiffre tout votre trafic internet. Ensemble, ils offrent une protection
                complète de votre vie privée en ligne : le DNS protège vos requêtes de noms de domaine, et le VPN masque
                votre adresse IP et chiffre toutes vos données.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
