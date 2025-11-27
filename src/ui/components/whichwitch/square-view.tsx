"use client"

import { useState } from "react"
import { WorkCard } from "./work-card"
import { Input } from "@/components/ui/input"
import { Search, Filter, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWorks } from "@/lib/hooks/useWorks"
import { useUser } from "@/lib/hooks/useUser"
import { useCollections } from "@/lib/hooks/useCollections"

export function SquareView({
  onCollect,
  folders: propFolders,
  onCreateFolder: propOnCreateFolder,
}: {
  onCollect: (id: number, folder: string) => void
  folders: string[]
  onCreateFolder: (name: string) => void
}) {
  const [search, setSearch] = useState("")
  const { works, loading, error } = useWorks()
  const { user } = useUser()
  const { folders: dbFolders, addCollection, addFolder } = useCollections(user?.id)
  
  // 使用数据库的文件夹，如果没有则使用 props
  const folders = dbFolders.length > 0 ? dbFolders : propFolders.map(name => ({ id: 0, name, user_id: 0, description: null, is_default: false, created_at: '', updated_at: '' }))
  
  const handleCollect = async (workId: number, folderName: string) => {
    if (!user?.id) {
      console.error('User not logged in')
      return
    }
    
    try {
      // 找到文件夹 ID
      const folder = folders.find(f => f.name === folderName)
      if (!folder) {
        console.error('Folder not found:', folderName)
        return
      }
      
      await addCollection(workId, folder.id)
      onCollect(workId, folderName) // 通知父组件
    } catch (error) {
      console.error('Failed to collect work:', error)
    }
  }
  
  const handleCreateFolder = async (name: string) => {
    if (!user?.id) return
    
    try {
      await addFolder(name)
      propOnCreateFolder(name) // 通知父组件
    } catch (error) {
      console.error('Failed to create folder:', error)
    }
  }

  const COMMON_FILTERS = ["Digital", "Wood", "Clay", "Glass", "Metal", "Cyberpunk", "Minimalist", "Nature", "Abstract"]

  const handleFilterClick = (tag: string) => {
    setSearch(search === tag ? "" : tag)
  }

  // 转换数据库作品格式为组件需要的格式
  const transformedWorks = works.map((work: any) => ({
    id: work.work_id,
    title: work.title,
    author: work.creator_address.slice(0, 6) + '...' + work.creator_address.slice(-4),
    image: work.image_url,
    tags: work.tags || [],
    material: work.material?.join(', ') || '',
    likes: work.like_count || 0,
    remixCount: work.remix_count || 0,
    allowRemix: work.allow_remix,
    isRemix: work.is_remix,
    story: work.story || work.description || '',
    createdAt: work.created_at,
  }))

  const filteredWorks = transformedWorks.filter(
    (w) =>
      w.title.toLowerCase().includes(search.toLowerCase()) ||
      w.author.toLowerCase().includes(search.toLowerCase()) ||
      w.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase())) ||
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading works...</span>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-500">Failed to load works. Please try again.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      ) : filteredWorks.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>No works found. {search && 'Try a different search term.'}</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredWorks.map((work) => (
            <WorkCard
              key={work.id}
              work={work}
              allowTip={true}
              onCollect={(folder) => handleCollect(work.id, folder)}
              folders={folders.map(f => f.name)}
              onCreateFolder={handleCreateFolder}
            />
          ))}
        </div>
      )}
    </div>
  )
}
