"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Heart, UserPlus, Play, ThumbsUp, ThumbsDown, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"
// REMOVED: import { supabase } from "@/lib/supabase" // Removed incorrect Supabase import
import { createBrowserClient } from "@supabase/ssr" // Import for Supabase client

// Constants for user pagination
const USERS_PER_PAGE = 10

interface CinemaRoom {
  id: string
  room_number: number
  name: string
  capacity: number
  theme: string
  movie_title: string
  movie_tmdb_id: number | null
  movie_poster: string | null
  schedule_start: string | null
  schedule_end: string | null
  access_level: string
  is_open: boolean
  embed_url: string | null
  created_at: string
  updated_at: string
}

interface AvatarOption {
  id: string
  category: string
  label: string
  value: string
  is_premium: boolean
  created_at: string
}

export default function AdminPage() {
  const { user, loading: userLoading } = useAuth() // Added userLoading to the destructuring
  const { toast } = useToast()
  const router = useRouter()

  // States pour tous les types de contenu
  const [tvChannels, setTvChannels] = useState([])
  const [radioStations, setRadioStations] = useState([])
  const [retrogamingSources, setRetrogamingSources] = useState([])
  const [users, setUsers] = useState<any[]>([]) // Corrected type from any[]
  const [requests, setRequests] = useState([])
  const [musicContent, setMusicContent] = useState([])
  const [software, setSoftware] = useState([])
  const [games, setGames] = useState([])
  const [ebooks, setEbooks] = useState([])
  const [totalUsersInDB, setTotalUsersInDB] = useState(0)
  const [totalUserCount, setTotalUserCount] = useState(0) // Keep for compatibility if needed

  // States pour les modals
  const [activeModal, setActiveModal] = useState(null)
  const [editingItem, setEditingItem] = useState(null)

  // States pour les recherches
  const [searchTerms, setSearchTerms] = useState({})

  // States pour les statistiques
  const [stats, setStats] = useState({
    totalContent: 0,
    totalUsers: 0,
    totalRevenue: 0,
    activeUsers: 0,
    vipUsers: 0,
    contentByType: {
      movies: 0,
      tvShows: 0,
      anime: 0,
      tvChannels: 0,
      radio: 0,
      retrogaming: 0,
      music: 0,
      software: 0,
      games: 0,
      ebooks: 0,
    },
    userGrowth: [],
    revenueByMonth: [],
    topContent: [],
    systemHealth: {
      uptime: "99.9%",
      responseTime: "120ms",
      errorRate: "0.1%",
      bandwidth: "2.5 TB",
    },
  })

  const [onlineStats, setOnlineStats] = useState({
    onlineNow: 0,
    onlineLastHour: 0,
    onlineLast24h: 0,
  })

  const [recentActivities, setRecentActivities] = useState([])
  const [activityLoading, setActivityLoading] = useState(false)

  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [loading, setLoading] = useState(true) // Moved up as per CHANGE

  // States pour le système check
  const [systemCheck, setSystemCheck] = useState({
    checking: false,
    lastCheck: null,
    results: {
      tmdb: { status: "operational", responseTime: "120ms" },
      database: { status: "connected", responseTime: "45ms" },
      servers: { status: "online", responseTime: "89ms" },
    },
  })

  // Formulaires
  const [tvChannelForm, setTvChannelForm] = useState({
    name: "",
    category: "",
    country: "",
    language: "",
    stream_url: "",
    logo_url: "",
    description: "",
    quality: "HD",
    is_active: true,
  })

  const [radioForm, setRadioForm] = useState({
    name: "",
    genre: "",
    country: "",
    frequency: "",
    stream_url: "",
    logo_url: "",
    description: "",
    website: "",
    is_active: true,
  })

  const [retrogamingSourceForm, setRetrogamingSourceForm] = useState({
    name: "",
    description: "",
    url: "",
    color: "bg-blue-600",
    category: "",
    is_active: true,
  })

  const [musicForm, setMusicForm] = useState({
    title: "",
    artist: "",
    description: "",
    thumbnail_url: "",
    video_url: "",
    streaming_url: "",
    duration: 0,
    release_year: new Date().getFullYear().toString(),
    genre: "",
    type: "Single",
    quality: "HD",
    is_active: true,
  })

  const [softwareForm, setSoftwareForm] = useState({
    name: "",
    developer: "",
    description: "",
    icon_url: "",
    download_url: "",
    version: "",
    category: "",
    platform: "",
    license: "Free",
    file_size: "",
    is_active: true,
  })

  const [gameForm, setGameForm] = useState({
    title: "",
    developer: "",
    publisher: "",
    description: "",
    cover_url: "",
    download_url: "",
    version: "",
    genre: "",
    platform: "",
    rating: "PEGI 3",
    file_size: "",
    is_active: true,
  })

  const [ebookForm, setEbookForm] = useState({
    title: "",
    author: "",
    description: "",
    cover_url: "",
    download_url: "",
    reading_url: "",
    isbn: "",
    publisher: "",
    category: "",
    language: "Français",
    pages: 0,
    file_format: "PDF",
    file_size: "",
    is_audiobook: false,
    audiobook_url: "",
    is_active: true,
  })

  const [broadcastForm, setBroadcastForm] = useState({
    subject: "",
    content: "",
  })
  const [sendingBroadcast, setSendingBroadcast] = useState(false)

  const [changelogs, setChangelogs] = useState<any[]>([])
  const [newChangelog, setNewChangelog] = useState({
    version: "",
    title: "",
    description: "",
    release_date: new Date().toISOString().split("T")[0],
  })

  // State for user form editing
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    is_vip: false,
    is_vip_plus: false,
    is_beta: false,
    is_admin: false,
    is_uploader: false, // Added is_uploader state
  })
  const [newPassword, setNewPassword] = useState("")
  const [editingUser, setEditingUser] = useState(null)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)

  // State for user table filtering and pagination
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all") // Renamed from userGradeFilter
  const [userCurrentPage, setUserCurrentPage] = useState<number>(1) // Renamed from userPage

  const [editingLog, setEditingLog] = useState<any>(null)

  const [siteSettings, setSiteSettings] = useState({
    hero: true,
    trending_movies: true,
    trending_tv_shows: true,
    popular_anime: true,
    popular_collections: true,
    public_playlists: true,
    trending_actors: true,
    trending_tv_channels: true,
    subscription_offer: true,
    random_content: true,
    football_calendar: true,
    calendar_widget: true,
  })

  const [worldSettings, setWorldSettings] = useState({
    maxCapacity: 100,
    worldMode: "day",
    playerInteractionsEnabled: true,
    showStatusBadges: true,
    enableChat: true,
    enableEmojis: true,
    enableJumping: true,
  })

  const [avatarOptions, setAvatarOptions] = useState<AvatarOption[]>([])
  const [newOption, setNewOption] = useState({
    category: "hair_style",
    label: "",
    value: "",
    is_premium: false,
  })

  // Added state for Cinema Rooms Management
  const [cinemaRooms, setCinemaRooms] = useState<CinemaRoom[]>([])

  // Added state for Online Users count
  const [onlineUsersCount, setOnlineUsersCount] = useState(0)

  const [arcadeMachines, setArcadeMachines] = useState<any[]>([])
  const [stadium, setStadium] = useState<any>(null)

  // États pour la gestion des jeux d'arcade
  const [showAddArcadeGame, setShowAddArcadeGame] = useState(false)
  const [editingArcadeGame, setEditingArcadeGame] = useState<any>(null)
  const [arcadeGameForm, setArcadeGameForm] = useState({
    name: "",
    url: "",
    image_url: "",
    media_type: "image",
    open_in_new_tab: false,
    use_proxy: false,
  })

  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [adminMessage, setAdminMessage] = useState("")

  // Define isFullAdmin and isUploader
  const isFullAdmin = user?.isAdmin || false
  const isUploader = user?.isUploader && !user?.isAdmin // Only uploader if NOT admin

  // Define tabs accessible to uploaders
  const uploaderAllowedTabs = ["music", "games", "software", "ebooks", "requests"]
  const canAccessTab = (tab: string) => {
    if (isFullAdmin) return true
    if (isUploader) return uploaderAllowedTabs.includes(tab)
    return false
  }

  // Only full admins can delete content, uploaders cannot
  const canDelete = isFullAdmin

  // Uploaders start on "music" tab, full admins on "dashboard"
  const [activeTab, setActiveTab] = useState(isFullAdmin ? "dashboard" : "music")

  // Combined user and uploader check for access
  useEffect(() => {
    if (!user || (!user.isAdmin && !user.isUploader)) {
      router.push("/") // Redirect to homepage if not admin or uploader
    }
  }, [user, router]) // Dependency on 'user' ensures it runs when authentication state changes

  // Fetches all data on mount or when user role changes
  useEffect(() => {
    // Only fetch data if user is logged in and has appropriate role
    if (user && (user.isAdmin || user.isUploader)) {
      console.log("[v0] Admin page: Fetching initial data...")
      fetchAllData()
    }
  }, [user]) // Dependency on 'user' ensures it runs when authentication state changes

  // Fetch interactive world data only when that tab is active
  useEffect(() => {
    if (user && (user.isAdmin || user.isUploader) && activeTab === "interactive-world" && !loading) {
      loadWorldSettings()
      loadCinemaRooms()
      loadAvatarOptions()
      loadOnlineUsers()
      loadArcadeMachines()
      loadStadium()
    }
  }, [user, activeTab, loading]) // Added loading dependency to ensure it runs after initial data load

  // Refactored the online user interval logic to be dependent on activeTab and loading state
  useEffect(() => {
    // Only set interval if the user is logged in and the interactive world tab is active
    if (user && (user.isAdmin || user.isUploader) && activeTab === "interactive-world" && !loading) {
      const intervalId = setInterval(() => {
        loadOnlineUsers()
      }, 15000) // Refresh every 15 seconds

      // Cleanup interval on component unmount or when activeTab changes away from interactive-world
      return () => clearInterval(intervalId)
    }
  }, [user, activeTab, loading]) // Dependencies ensure reactivity

  const handleUpdateRequestStatus = async (id: string, status: string) => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    try {
      const { error } = await supabase.from("content_requests").update({ status }).eq("id", id)
      if (error) throw error
      setRequests((prev) => prev.map((req) => (req.id === id ? { ...req, status } : req)))
      toast({ title: "Statut mis à jour", description: `La demande #${id} est maintenant ${status}.` })
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut de la demande:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la demande.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRequest = async (id: string) => {
    if (!canDelete) {
      toast({
        title: "Permission refusée",
        description: "Vous n'avez pas la permission de supprimer des demandes.",
        variant: "destructive",
      })
      return
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    try {
      const { error } = await supabase.from("content_requests").delete().eq("id", id)
      if (error) throw error
      setRequests((prev) => prev.filter((req) => req.id !== id))
      toast({ title: "Demande supprimée", description: `La demande #${id} a été supprimée.` })
    } catch (error) {
      console.error("Erreur lors de la suppression de la demande:", error)
      toast({ title: "Erreur", description: "Impossible de supprimer la demande.", variant: "destructive" })
    }
  }

  const loadMusicContent = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    try {
      const { data, error } = await supabase.from("music_content").select("*").order("created_at", { ascending: false })
      if (error) throw error
      setMusicContent(data || [])
    } catch (error) {
      console.error("Error loading music content:", error)
      setMusicContent([])
    }
  }

  const loadSoftware = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    try {
      const { data, error } = await supabase.from("software").select("*").order("created_at", { ascending: false })
      if (error) throw error
      setSoftware(data || [])
    } catch (error) {
      console.error("Error loading software:", error)
      setSoftware([])
    }
  }

  const loadGames = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    try {
      const { data, error } = await supabase.from("games").select("*").order("created_at", { ascending: false })
      if (error) throw error
      setGames(data || [])
    } catch (error) {
      console.error("Error loading games:", error)
      setGames([])
    }
  }

  const loadEbooks = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    try {
      const { data, error } = await supabase.from("ebooks").select("*").order("created_at", { ascending: false })
      if (error) throw error
      setEbooks(data || [])
    } catch (error) {
      console.error("Error loading ebooks:", error)
      setEbooks([])
    }
  }

  const handleSendBroadcast = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    if (!broadcastForm.subject || !broadcastForm.content) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      })
      return
    }

    setSendingBroadcast(true)
    try {
      // Get all user IDs without limit
      const {
        data: allUsers,
        error: usersError,
        count: totalUsersCount,
      } = await supabase.from("user_profiles").select("id", { count: "exact", head: true })

      if (usersError) throw usersError

      if (!allUsers || allUsers.length === 0) {
        toast({
          title: "Aucun utilisateur",
          description: "Aucun utilisateur trouvé pour envoyer le message",
          variant: "destructive",
        })
        return
      }

      // Get current admin user ID
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Create messages for all users
      const messages = allUsers.map((u) => ({
        sender_id: user.id,
        recipient_id: u.id,
        subject: broadcastForm.subject,
        content: broadcastForm.content,
        is_read: false,
      }))

      const { error: insertError } = await supabase.from("user_messages").insert(messages)

      if (insertError) throw insertError

      toast({
        title: "Message envoyé",
        description: `Message diffusé à ${allUsers.length} utilisateur(s)`,
      })

      setBroadcastForm({ subject: "", content: "" })
      setActiveModal(null)
    } catch (error) {
      console.error("Error sending broadcast:", error)
      toast({
        title: "Erreur",
        description: `Erreur lors de l'envoi: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setSendingBroadcast(false)
    }
  }

  const handleSendAdminMessage = async () => {
    if (!adminMessage.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez écrire un message",
        variant: "destructive",
      })
      return
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // </CHANGE>Changed subject to match requested format
      const { error } = await supabase.from("user_messages").insert({
        sender_id: user.id,
        recipient_id: selectedRequest?.user_id,
        subject: `Réponse du Staff à votre demande ${selectedRequest?.title}`,
        content: adminMessage,
        is_read: false,
      })

      if (error) throw error

      toast({
        title: "Message envoyé",
        description: `Message envoyé à ${selectedRequest?.username}`,
      })

      setMessageDialogOpen(false)
      setAdminMessage("")
      setSelectedRequest(null)
    } catch (error: any) {
      console.error("Error sending admin message:", error)
      toast({
        title: "Erreur",
        description: `Erreur lors de l'envoi: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const loadRealTVChannels = async (supabase) => {
    try {
      console.log("🔄 Chargement des chaînes TV...")
      const { data, error } = await supabase.from("tv_channels").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Erreur Supabase TV channels:", error)
        throw error
      }

      console.log(`✅ ${data?.length || 0} chaînes TV chargées:`, data)
      setTvChannels(data || [])
      return data || []
    } catch (error) {
      console.error("❌ Erreur lors du chargement des chaînes TV:", error)
      setTvChannels([])
      throw error
    }
  }

  const loadRealRadioStations = async (supabase) => {
    try {
      console.log("🔄 Chargement des stations radio...")
      const { data, error } = await supabase
        .from("radio_stations")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Erreur Supabase radio stations:", error)
        throw error
      }

      console.log(`✅ ${data?.length || 0} stations radio chargées:`, data)
      setRadioStations(data || [])
      return data || []
    } catch (error) {
      console.error("❌ Erreur lors du chargement des stations radio:", error)
      setRadioStations([])
      throw error
    }
  }

  const loadRealRetrogamingSources = async (supabase) => {
    try {
      console.log("🔄 Chargement des sources retrogaming...")
      const { data, error } = await supabase
        .from("retrogaming_sources")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Erreur Supabase retrogaming sources:", error)
        throw error
      }

      console.log(`✅ ${data?.length || 0} sources retrogaming chargées:`, data)
      setRetrogamingSources(data || [])
      return data || []
    } catch (error) {
      console.error("❌ Erreur lors du chargement des sources retrogaming:", error)
      setRetrogamingSources([])
      throw error
    }
  }

  const loadRealUsers = async (supabase) => {
    try {
      console.log("[v0] Loading users from database...")

      // Get total count
      const { count: totalCount, error: countError } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })

      if (countError) {
        console.error("[v0] Error counting users:", countError)
        setTotalUsersInDB(0)
      } else {
        setTotalUsersInDB(totalCount || 0)
        console.log(`[v0] Total users in DB: ${totalCount}`)
      }

      // Load ALL users with pagination to avoid limits
      let allUsers = []
      let page = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data: pageData, error: usersError } = await supabase
          .from("user_profiles")
          .select(
            "id, user_id, username, email, status, is_admin, is_uploader, is_vip, is_vip_plus, is_beta, created_at, vip_expires_at",
          )
          .order("created_at", { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1)

        if (usersError) {
          console.error("[v0] Error loading users:", usersError)
          throw usersError
        }

        if (pageData && pageData.length > 0) {
          allUsers = [...allUsers, ...pageData]
          page++
          hasMore = pageData.length === pageSize
        } else {
          hasMore = false
        }
      }

      console.log(`[v0] Loaded ${allUsers.length} user profiles`)

      // Process users with proper defaults
      const processedUsers = allUsers.map((user) => ({
        ...user,
        is_admin: Boolean(user.is_admin),
        is_uploader: Boolean(user.is_uploader),
        is_vip: Boolean(user.is_vip),
        is_vip_plus: Boolean(user.is_vip_plus),
        is_beta: Boolean(user.is_beta),
        status: user.status || "active",
        username: user.username || user.email?.split("@")[0] || "Unknown User",
      }))

      setUsers(processedUsers)
      console.log(`[v0] Processed ${processedUsers.length} users successfully`)
    } catch (error) {
      console.error("[v0] Fatal error loading users:", error)
      setUsers([])
    }
  }

  const loadRequests = async (supabase) => {
    try {
      const { data, error } = await supabase
        .from("content_requests")
        .select("*, user_profiles(username, email)")
        .order("created_at", { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error("Error loading requests:", error)
    }
  }

  const loadRecentActivities = async () => {
    setActivityLoading(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    try {
      console.log("🔄 Chargement des activités récentes...")

      const activities = []

      const { data: loginHistory, error: loginError } = await supabase
        .from("user_login_history")
        .select(`
          *,
          user_profiles!user_login_history_user_id_fkey(username, email)
        `)
        .order("login_at", {
          ascending: false,
        })
        .limit(50)

      if (loginError) {
        console.error("❌ Erreur login history:", loginError)
      } else {
        loginHistory?.forEach((login) => {
          activities.push({
            id: `login_${login.id}`,
            type: "login",
            user: login.user_profiles?.username || login.user_profiles?.email || "Utilisateur inconnu",
            description: `Connexion depuis ${login.ip_address || "IP inconnue"}`,
            details: login.user_agent ? `${login.user_agent.substring(0, 50)}...` : null,
            timestamp: new Date(login.login_at),
            icon: LogIn,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
          })
        })
      }

      const { data: newUsers, error: usersError } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", {
          ascending: false,
        })
        .limit(20)

      if (usersError) {
        console.error("❌ Erreur new users:", usersError)
      } else {
        newUsers?.forEach((user) => {
          activities.push({
            id: `user_${user.id}`,
            type: "new_user",
            user: user.username || user.email || "Utilisateur inconnu",
            description: "Nouvel utilisateur inscrit",
            details: user.is_vip ? "Compte VIP" : user.is_admin ? "Compte Admin" : "Compte standard",
            timestamp: new Date(user.created_at),
            icon: UserPlus,
            color: "text-green-600",
            bgColor: "bg-green-100",
          })
        })
      }

      const { data: watchHistory, error: watchError } = await supabase
        .from("user_watch_history")
        .select(`
          *,
          user_profiles!user_watch_history_user_id_fkey(username, email)
        `)
        .order("last_watched_at", {
          ascending: false,
        })
        .limit(30)

      if (watchError) {
        console.error("❌ Erreur watch history:", watchError)
      } else {
        watchHistory?.forEach((watch) => {
          activities.push({
            id: `watch_${watch.id}`,
            type: "watched",
            user: watch.user_profiles?.username || watch.user_profiles?.email || "Utilisateur inconnu",
            description: `A regardé "${watch.content_title}"`,
            details: `${watch.content_type === "movie" ? "Film" : "Série"} - ${Math.round(watch.progress || 0)}% terminé`,
            timestamp: new Date(watch.last_watched_at),
            contentType: watch.content_type,
            icon: Play,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
          })
        })
      }

      const { data: ratings, error: ratingsError } = await supabase
        .from("user_ratings")
        .select(`
          *,
          user_profiles!user_ratings_user_id_fkey(username, email)
        `)
        .order("created_at", {
          ascending: false,
        })
        .limit(30)

      if (ratingsError) {
        console.error("❌ Erreur ratings:", ratingsError)
      } else {
        ratings?.forEach((rating) => {
          activities.push({
            id: `rating_${rating.id}`,
            type: "rating",
            user: rating.user_profiles?.username || rating.user_profiles?.email || "Utilisateur inconnu",
            description: `A ${rating.rating === "like" ? "liké" : "disliké"} un contenu`,
            details: `${rating.content_type === "movie" ? "Film" : "Série"}`,
            timestamp: new Date(rating.created_at),
            contentType: rating.content_type,
            rating: rating.rating,
            icon: rating.rating === "like" ? ThumbsUp : ThumbsDown,
            color: rating.rating === "like" ? "text-green-600" : "text-red-600",
            bgColor: rating.rating === "like" ? "bg-green-100" : "bg-red-100",
          })
        })
      }

      const { data: wishlistItems, error: wishlistError } = await supabase
        .from("user_wishlist")
        .select(`
          *,
          user_profiles!user_wishlist_user_id_fkey(username, email)
        `)
        .order("created_at", {
          ascending: false,
        })
        .limit(20)

      if (wishlistError) {
        console.error("❌ Erreur wishlist:", wishlistError)
      } else {
        wishlistItems?.forEach((item) => {
          activities.push({
            id: `wishlist_${item.id}`,
            type: "wishlist",
            user: item.user_profiles?.username || item.user_profiles?.email || "Utilisateur inconnu",
            description: `A ajouté "${item.content_title}" à sa liste de souhaits`,
            details: `${item.content_type === "movie" ? "Film" : "Série"}`,
            timestamp: new Date(item.created_at),
            contentType: item.content_type,
            icon: Heart,
            color: "text-pink-600",
            bgColor: "bg-pink-100",
          })
        })
      }

      setRecentActivities(activities)
    } catch (error) {
      console.error("Error loading recent activities:", error)
    } finally {
      setActivityLoading(false)
    }
  }

  const fetchAllData = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    try {
      await Promise.all([
        loadRealTVChannels(supabase),
        loadRealRadioStations(supabase),
        loadRealRetrogamingSources(supabase),
        loadRealUsers(supabase),
        loadRequests(supabase),
        loadRecentActivities(),
      ])
      setLoading(false)
    } catch (error) {
      console.error("Error fetching all data:", error)
      setLoading(false)
    }
  }

  const loadWorldSettings = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    try {
      const { data, error } = await supabase.from("world_settings").select("*")
      if (error) throw error
      setWorldSettings(data[0] || {})
    } catch (error) {
      console.error("Error loading world settings:", error)
      setWorldSettings({})
    }
  }

  const loadCinemaRooms = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    try {
      const { data, error } = await supabase.from("cinema_rooms").select("*")
      if (error) throw error
      setCinemaRooms(data || [])
    } catch (error) {
      console.error("Error loading cinema rooms:", error)
      setCinemaRooms([])
    }
  }

  const loadAvatarOptions = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    try {
      const { data, error } = await supabase.from("avatar_options").select("*")
      if (error) throw error
      setAvatarOptions(data || [])
    } catch (error) {
      console.error("Error loading avatar options:", error)
      setAvatarOptions([])
    }
  }

  const loadOnlineUsers = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    try {
      const { data, error } = await supabase.from("online_users").select("*")
      if (error) throw error
      setOnlineUsersCount(data?.length || 0)
    } catch (error) {
      console.error("Error loading online users:", error)
      setOnlineUsersCount(0)
    }
  }

  const loadArcadeMachines = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    try {
      const { data, error } = await supabase.from("arcade_machines").select("*")
      if (error) throw error
      setArcadeMachines(data || [])
    } catch (error) {
      console.error("Error loading arcade machines:", error)
      setArcadeMachines([])
    }
  }

  const loadStadium = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    try {
      const { data, error } = await supabase.from("stadium").select("*")
      if (error) throw error
      setStadium(data[0] || {})
    } catch (error) {
      console.error("Error loading stadium:", error)
      setStadium({})
    }
  }
}
