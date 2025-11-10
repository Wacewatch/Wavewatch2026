import { Suspense } from "react"
import { Hero } from "@/components/hero"
import { TrendingMovies } from "@/components/trending-movies"
import { TrendingTVShows } from "@/components/trending-tv-shows"
import { PopularAnime } from "@/components/popular-anime"
import { TrendingActors } from "@/components/trending-actors"
import { TrendingTVChannels } from "@/components/trending-tv-channels"
import { CalendarWidget } from "@/components/calendar-widget"
import { FootballCalendarWidget } from "@/components/football-calendar-widget"
import { RandomContent } from "@/components/random-content"
import { SubscriptionOffer } from "@/components/subscription-offer"
import { PublicPlaylistsRow } from "@/components/public-playlists-row"
import { PopularCollections } from "@/components/popular-collections"

function LoadingSection() {
  return (
    <div className="space-y-4">
      <div className="h-8 bg-muted rounded animate-pulse"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] bg-muted rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="space-y-8">
      <Hero />
      <div className="container mx-auto px-4 space-y-12">
        <Suspense fallback={<LoadingSection />}>
          <TrendingMovies />
        </Suspense>
        <Suspense fallback={<LoadingSection />}>
          <TrendingTVShows />
        </Suspense>
        <Suspense fallback={<LoadingSection />}>
          <PopularAnime />
        </Suspense>
        <Suspense fallback={<LoadingSection />}>
          <PopularCollections />
        </Suspense>
        <Suspense fallback={<LoadingSection />}>
          <PublicPlaylistsRow />
        </Suspense>
        <Suspense fallback={<LoadingSection />}>
          <TrendingActors />
        </Suspense>
        <Suspense fallback={<LoadingSection />}>
          <TrendingTVChannels />
        </Suspense>
        <SubscriptionOffer />
        <Suspense fallback={<LoadingSection />}>
          <RandomContent />
        </Suspense>
        <Suspense fallback={<LoadingSection />}>
          <FootballCalendarWidget />
        </Suspense>
        <Suspense fallback={<LoadingSection />}>
          <CalendarWidget />
        </Suspense>
      </div>
    </div>
  )
}
