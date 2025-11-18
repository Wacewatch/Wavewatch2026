import { MapIcon } from 'lucide-react' // Added MapIcon import
import React, { useState, useEffect } from 'react'
import { supabase } from 'path-to-supabase'
import { Html } from '@react-three/drei'
import { RealisticAvatar } from 'path-to-avatar'
import { User, Users, MessageCircle, Settings, Film, X, Shield, Crown, Star, Palette } from 'path-to-icons'
import useTexture from 'path-to-useTexture'

const InteractiveWorld = ({ userProfile, onlineCount, worldSettings }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false)
  const [showCinema, setShowCinema] = useState(false)
  const [showUserCard, setShowUserCard] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showCinemaModal, setShowCinemaModal] = useState(false)
  const [currentCinemaRoom, setCurrentCinemaRoom] = useState<any>(null)
  const [currentSeat, setCurrentSeat] = useState<any>(null)
  const [graphicsQuality, setGraphicsQuality] = useState('medium')
  const [isMobileMode, setIsMobileMode] = useState(false)
  const [forceInputMode, setForceInputMode] = useState<'auto' | 'keyboard' | 'joystick'>('auto')
  const [povMode, setPovMode] = useState(false)
  const [playerActions, setPlayerActions] = useState({})
  const [playerChatBubbles, setPlayerChatBubbles] = useState({})
  const otherPlayers = []
  const [cinemaRooms, setCinemaRooms] = useState<any[]>([])

  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth < 1024
      
      if (forceInputMode === 'keyboard') {
        setIsMobileMode(false)
      } else if (forceInputMode === 'joystick') {
        setIsMobileMode(true)
      } else {
        setIsMobileMode(isTouchDevice || isSmallScreen)
      }
      
      console.log('[v0] Mobile mode:', isTouchDevice || isSmallScreen, 'Touch:', isTouchDevice, 'Screen:', isSmallScreen, 'Control mode:', forceInputMode)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [forceInputMode])

  useEffect(() => {
    const channel = supabase.channel('world-actions')

    channel
      .on('broadcast', { event: 'player-emoji' }, ({ payload }) => {
        console.log('[v0] Received emoji broadcast:', payload)
        if (payload.userId && payload.userId !== userProfile?.id) {
          setPlayerActions(prev => ({
            ...prev,
            [payload.userId]: {
              action: 'emoji',
              emoji: payload.emoji,
              timestamp: payload.timestamp
            }
          }))
          
          setTimeout(() => {
            setPlayerActions(prev => {
              const updated = { ...prev }
              delete updated[payload.userId]
              return updated
            })
          }, 3000)
        }
      })
      .on('broadcast', { event: 'player-action' }, ({ payload }) => {
        console.log('[v0] Received action broadcast:', payload)
        if (payload.userId && payload.userId !== userProfile?.id) {
          setPlayerActions(prev => ({
            ...prev,
            [payload.userId]: {
              action: payload.action,
              timestamp: payload.timestamp
            }
          }))
          
          setTimeout(() => {
            setPlayerActions(prev => {
              const updated = { ...prev }
              delete updated[payload.userId]
              return updated
            })
          }, 500)
        }
      })
      .subscribe((status) => {
        console.log('[v0] World actions channel status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userProfile])

  useEffect(() => {
    loadCinemaRooms()
  }, [])

  const loadCinemaRooms = async () => {
    const { data, error } = await supabase
      .from('interactive_cinema_rooms')
      .select(`
        *,
        seats:interactive_cinema_seats(
          id,
          is_occupied,
          user_id
        )
      `)
      .eq('is_open', true)
      .order('room_number', { ascending: true })

    if (!error && data) {
      console.log('[v0] Loaded cinema rooms:', data)
      setCinemaRooms(data)
    }
  }

  const handleAutoSit = async () => {
    if (!currentCinemaRoom || !userProfile) {
      console.log('[v0] Cannot sit: missing room or profile')
      return
    }

    // Find first available seat
    const { data: availableSeats, error } = await supabase
      .from('interactive_cinema_seats')
      .select('*')
      .eq('room_id', currentCinemaRoom.id)
      .eq('is_occupied', false)
      .limit(1)
      .single()

    if (error || !availableSeats) {
      alert('Aucun siège disponible')
      return
    }

    // Occupy the seat
    const { error: occupyError } = await supabase
      .from('interactive_cinema_seats')
      .update({
        user_id: userProfile.id,
        is_occupied: true,
        occupied_at: new Date().toISOString()
      })
      .eq('id', availableSeats.id)

    if (!occupyError) {
      setCurrentSeat(availableSeats)
      alert(`Vous êtes assis au siège Rangée ${availableSeats.row_number}, Siège ${availableSeats.seat_number}`)
    }
  }

  const handleLeaveCinema = async () => {
    if (!currentCinemaRoom || !userProfile) return

    // Free the seat if occupied
    if (currentSeat) {
      await supabase
        .from('interactive_cinema_seats')
        .update({
          user_id: null,
          is_occupied: false,
          occupied_at: null
        })
        .eq('id', currentSeat.id)
    }

    // Update player position to outside cinema
    await supabase
      .from('interactive_profiles')
      .update({
        current_room: null,
        position_x: 0,
        position_z: 0
      })
      .eq('user_id', userProfile.id)

    setCurrentCinemaRoom(null)
    setCurrentSeat(null)
  }

  return (
    <>
      {otherPlayers
        .filter(p => !currentCinemaRoom || p.current_room === `cinema_${currentCinemaRoom.id}`)
        .map((player) => {
          const playerProfile = player.user_profiles
          const avatarStyle = player.avatar_style || { bodyColor: '#ef4444', headColor: '#fbbf24', faceSmiley: '😊' }
          const playerAction = playerActions[player.user_id]
          const isPlayerJumping = playerAction && playerAction.action === 'jump' && Date.now() - playerAction.timestamp < 500

          return (
            <group key={player.user_id}>
              <RealisticAvatar
                position={[player.position_x || 0, (isPlayerJumping ? 1.5 : 0.5), player.position_z || 0]}
                avatarStyle={avatarStyle}
                isMoving={false}
              />

              {worldSettings.showStatusBadges && (
                <Html position={[player.position_x || 0, 2.3, player.position_z || 0]} center depthTest={false} zIndexRange={[100, 0]}>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1 bg-black/80 px-2 py-1 rounded-full backdrop-blur-sm">
                      <span className="text-white text-xs font-medium">{player.username || playerProfile?.username || 'Joueur'}</span>
                      {playerProfile?.is_admin && <Shield className="w-3 h-3 text-red-500" title="Admin" />}
                      {playerProfile?.is_vip_plus && !playerProfile?.is_admin && <Crown className="w-3 h-3 text-purple-400" title="VIP+" />}
                      {playerProfile?.is_vip && !playerProfile?.is_vip_plus && !playerProfile?.is_admin && <Star className="w-3 h-3 text-yellow-400" title="VIP" />}
                    </div>
                    {playerChatBubbles[player.user_id] && Date.now() - playerChatBubbles[player.user_id].timestamp < 5000 && (
                      <div className="bg-white text-black text-xs px-3 py-1 rounded-lg max-w-[200px] break-words shadow-lg">
                        {playerChatBubbles[player.user_id].message}
                      </div>
                    )}
                    {playerAction && playerAction.action === 'emoji' && Date.now() - playerAction.timestamp < 3000 && (
                      <div className="text-4xl animate-bounce">
                        {playerAction.emoji}
                      </div>
                    )}
                  </div>
                </Html>
              )}
            </group>
          )
        })}
      
      {showMenu && (
        <div className="absolute top-0 left-20 mt-0 bg-black/95 backdrop-blur-xl rounded-xl p-4 w-80 space-y-3 shadow-2xl border-2 border-white/30">
          <div className="text-white mb-3 pb-3 border-b border-white/20">
            <div className="font-bold text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              {userProfile?.username || 'Joueur'}
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
              <Users className="w-4 h-4" />
              <span>{onlineCount} en ligne</span>
            </div>
          </div>

          <button
            onClick={() => {
              setShowAvatarCustomizer(true)
              setShowMenu(false)
            }}
            className="w-full bg-purple-500/90 text-white py-3 rounded-lg hover:bg-purple-600 flex items-center justify-center gap-2 text-base font-medium transition-colors"
          >
            <Palette className="w-5 h-5" />
            Avatar
          </button>

          <button
            onClick={() => {
              setShowMap(true)
              setShowMenu(false)
            }}
            className="w-full bg-orange-500/90 text-white py-3 rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2 text-base font-medium transition-colors"
          >
            <MapIcon className="w-5 h-5" />
            Carte
          </button>

          {worldSettings.enableChat && (
            <button
              onClick={() => setShowUserCard(true)}
              className="w-full bg-green-500/90 text-white py-3 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 text-base font-medium transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Chat
            </button>
          )}

          {/* Added Settings button */}
          <button
            onClick={() => {
              setShowSettings(true)
              setShowMenu(false)
            }}
            className="w-full bg-blue-500/90 text-white py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 text-base font-medium transition-colors"
          >
            <Settings className="w-5 h-5" />
            Paramètres
          </button>

          {/* Added Cinema button */}
          <button
            onClick={() => {
              setShowCinemaModal(true)
              setShowMenu(false)
            }}
            className="w-full bg-red-500/90 text-white py-3 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 text-base font-medium transition-colors"
          >
            <Film className="w-5 h-5" />
            Cinéma
          </button>

          {currentCinemaRoom && (
            <>
              <button
                onClick={() => {
                  handleAutoSit()
                  setShowMenu(false)
                }}
                className="w-full bg-green-500/90 text-white py-3 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 text-base font-medium transition-colors"
              >
                <span className="text-xl">🪑</span>
                S'asseoir
              </button>

              <button
                onClick={() => {
                  handleLeaveCinema()
                  setShowMenu(false)
                }}
                className="w-full bg-red-500/90 text-white py-3 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 text-base font-medium transition-colors"
              >
                <X className="w-5 h-5" />
                Quitter la Salle
              </button>
            </>
          )}
        </div>
      )}

      {showMap && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl p-6 max-w-3xl w-full border-2 border-orange-500/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MapIcon className="w-6 h-6" />
                Carte du Monde
              </h2>
              <button
                onClick={() => setShowMap(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-lg p-8 min-h-[400px] border-2 border-white/10">
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} className="border border-white/20" />
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setShowMap(false)
                  setShowCinema(true)
                }}
                className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2 group"
              >
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-lg shadow-2xl flex items-center justify-center border-4 border-red-400/50 group-hover:scale-110 transition-transform">
                    <span className="text-4xl">🎬</span>
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Cinéma - OUVERT
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse border-2 border-white" />
                </div>
              </button>

              <div className="absolute top-1/2 right-1/4 transform translate-x-1/2 -translate-y-1/2">
                <div className="relative opacity-50 grayscale">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-900 rounded-lg shadow-2xl flex items-center justify-center border-4 border-purple-400/50">
                    <span className="text-4xl">🎮</span>
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Arcade - FERMÉ
                    </div>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">🔒</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                <div className="relative opacity-50 grayscale">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-green-900 rounded-lg shadow-2xl flex items-center justify-center border-4 border-green-400/50">
                    <span className="text-4xl">⚽</span>
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Stade - FERMÉ
                    </div>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">🔒</div>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse border-4 border-white shadow-xl" />
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">Vous</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-white/60 text-sm text-center">
              Cliquez sur un bâtiment ouvert pour y accéder
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full border-2 border-blue-500/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Paramètres
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white font-medium block mb-2">
                  Qualité Graphique
                </label>
                <select
                  value={graphicsQuality}
                  onChange={(e) => setGraphicsQuality(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>

              <div>
                <label className="text-white font-medium block mb-2">
                  Mode de Contrôle
                </label>
                <select
                  value={forceInputMode}
                  onChange={(e) => {
                    const mode = e.target.value as 'auto' | 'keyboard' | 'joystick'
                    setForceInputMode(mode)
                    if (mode === 'keyboard') {
                      setIsMobileMode(false)
                    } else if (mode === 'joystick') {
                      setIsMobileMode(true)
                    }
                  }}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                >
                  <option value="auto">Automatique</option>
                  <option value="keyboard">Clavier (PC)</option>
                  <option value="joystick">Joystick (Mobile)</option>
                </select>
                <p className="text-white/50 text-xs mt-1">
                  {forceInputMode === 'auto' && 'Détection automatique selon votre appareil'}
                  {forceInputMode === 'keyboard' && 'Utiliser ZQSD ou flèches pour se déplacer'}
                  {forceInputMode === 'joystick' && 'Utiliser le joystick tactile'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-white font-medium">Mode POV</label>
                <button
                  onClick={() => setPovMode(!povMode)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    povMode ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      povMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium mt-6"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {showCinemaModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-red-500/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Film className="w-6 h-6" />
                Salles de Cinéma
              </h2>
              <button
                onClick={() => setShowCinemaModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {cinemaRooms.map((room) => {
                const occupiedSeats = room.seats?.filter((s: any) => s.is_occupied).length || 0
                const totalSeats = room.capacity
                const availableSeats = totalSeats - occupiedSeats

                // Check if user has access based on grade
                const userHasAccess = 
                  room.access_level === 'all' ||
                  (room.access_level === 'vip' && (userProfile?.is_vip || userProfile?.is_vip_plus || userProfile?.is_admin)) ||
                  (room.access_level === 'vip_plus' && (userProfile?.is_vip_plus || userProfile?.is_admin)) ||
                  (room.access_level === 'admin' && userProfile?.is_admin)

                return (
                  <div
                    key={room.id}
                    className={`bg-black/40 rounded-lg p-4 border-2 transition-all ${
                      userHasAccess 
                        ? 'border-green-500/30 hover:border-green-500/60 cursor-pointer hover:bg-black/60' 
                        : 'border-red-500/30 opacity-60 cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (userHasAccess) {
                        setCurrentCinemaRoom(room)
                        setShowCinemaModal(false)
                      }
                    }}
                  >
                    <div className="flex gap-4">
                      {/* Movie Poster */}
                      <div className="w-24 h-36 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                        {room.movie_poster ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${room.movie_poster}`}
                            alt={room.movie_title || room.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            🎬
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          Salle {room.room_number}
                          {!userHasAccess && <span className="text-red-500 text-sm">🔒</span>}
                        </h3>

                        <p className="text-white/80 text-sm font-medium">
                          {room.movie_title || room.name}
                        </p>

                        {room.movie_tmdb_id && (
                          <p className="text-white/50 text-xs">
                            TMDB ID: {room.movie_tmdb_id}
                          </p>
                        )}

                        {room.schedule_start && (
                          <p className="text-white/60 text-xs">
                            Séance: {new Date(room.schedule_start).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            availableSeats > 10 ? 'bg-green-500/20 text-green-400' :
                            availableSeats > 0 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {availableSeats} / {totalSeats} places
                          </span>

                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            room.access_level === 'all' ? 'bg-blue-500/20 text-blue-400' :
                            room.access_level === 'vip' ? 'bg-yellow-500/20 text-yellow-400' :
                            room.access_level === 'vip_plus' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {room.access_level === 'all' && '👥 Tous'}
                            {room.access_level === 'vip' && '⭐ VIP'}
                            {room.access_level === 'vip_plus' && '👑 VIP+'}
                            {room.access_level === 'admin' && '🛡️ Admin'}
                          </span>
                        </div>

                        {!userHasAccess && (
                          <p className="text-red-400 text-xs">
                            Vous n'avez pas accès à cette salle
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {cinemaRooms.length === 0 && (
              <div className="text-center text-white/60 py-8">
                Aucune salle disponible pour le moment
              </div>
            )}
          </div>
        </div>
      )}

      {currentCinemaRoom && (
        <group position={[0, 0, 0]}>
          {/* Cinema screen */}
          <mesh position={[0, 3, -15]}>
            <boxGeometry args={[20, 10, 0.2]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>

          {/* Screen content - show movie poster if available */}
          {currentCinemaRoom.movie_poster && (
            <mesh position={[0, 3, -14.9]}>
              <planeGeometry args={[18, 9]} />
              <meshBasicMaterial 
                map={useTexture(`https://image.tmdb.org/t/p/w780${currentCinemaRoom.movie_poster}`)} 
              />
            </mesh>
          )}

          {/* Seats visualization (no buttons) */}
          {Array.from({ length: Math.ceil(currentCinemaRoom.capacity / 10) }).map((_, row) =>
            Array.from({ length: 10 }).map((_, seat) => {
              const seatIndex = row * 10 + seat
              if (seatIndex >= currentCinemaRoom.capacity) return null

              const seatData = currentCinemaRoom.seats?.[seatIndex]
              const isOccupied = seatData?.is_occupied
              const isMySeat = seatData?.user_id === userProfile?.id

              return (
                <mesh
                  key={`seat-${row}-${seat}`}
                  position={[
                    (seat - 4.5) * 2,
                    0.5,
                    row * 2 - 10
                  ]}
                >
                  <boxGeometry args={[0.8, 0.8, 0.8]} />
                  <meshStandardMaterial 
                    color={
                      isMySeat ? '#22c55e' :  // Green for my seat
                      isOccupied ? '#ef4444' : // Red for occupied
                      '#3b82f6'  // Blue for available
                    }
                  />
                </mesh>
              )
            })
          )}

          {/* Ambient cinema lighting */}
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 5, 10]} intensity={0.3} color="#60a5fa" />
        </group>
      )}
    </>
  )
}

export default InteractiveWorld
