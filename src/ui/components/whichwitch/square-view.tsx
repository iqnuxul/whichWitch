"use client"

import { useState } from "react"
import { WorkCard } from "./work-card"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SquareView({
  works,
  onCollect,
  folders,
  onCreateFolder,
}: {
  works: any[]
  onCollect: (id: number, folder: string) => void
  folders: string[]
  onCreateFolder: (name: string) => void
}) {
  const [search, setSearch] = useState("")

  const COMMON_FILTERS = ["Digital", "Wood", "Clay", "Glass", "Cyberpunk", "Minimalist"]

  const handleFilterClick = (tag: string) => {
    setSearch(search === tag ? "" : tag)
  }

  const filteredWorks = works.filter(
    (w) =>
      w.title.toLowerCase().includes(search.toLowerCase()) ||
      w.author.toLowerCase().includes(search.toLowerCase()) ||
      w.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      w.material?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="sticky top-[72px] z-40 bg-background/80 backdrop-blur-md py-4 -mx-6 px-6 border-b border-border/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Discover
            </h2>
            <p className="text-muted-foreground text-sm mt-1">Explore the genealogy of creativity</p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search artworks, styles, or artists..."
                className="pl-9 bg-muted/30 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="shrink-0 bg-transparent">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 pt-4 no-scrollbar">
          {COMMON_FILTERS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleFilterClick(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                search === tag
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:border-primary/50"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredWorks.map((work) => (
          <WorkCard
            key={work.id}
            work={work}
            allowTip={true}
            onCollect={(folder) => onCollect(work.id, folder)}
            folders={folders}
            onCreateFolder={onCreateFolder}
          />
        ))}
      </div>
    </div>
  )
}
