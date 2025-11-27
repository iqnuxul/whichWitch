"use client"

import { useState } from "react"
import { WorkCard } from "./work-card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { GitFork, Wallet, Folder, Upload } from "lucide-react"

import { useUser } from "@/lib/hooks/useUser"
import { useAccount } from "wagmi"
import { createAuthorizationRequest, updateAuthorizationStatus } from "@/lib/supabase/services"
import { requestAuthorization } from "@/lib/web3/services/contract.service"
import { useCollections } from "@/lib/hooks/useCollections"
import { Loader2 } from "lucide-react"

export function CollectionsView({
  onUnsave,
  folders: propFolders,
  onCreateFolder: propOnCreateFolder,
}: {
  onUnsave: (id: number) => void
  folders: string[]
  onCreateFolder: (name: string) => void
}) {
  const { user } = useUser()
  const { 
    collections, 
    folders: dbFolders, 
    authStatuses, 
    loading,
    addFolder,
    removeCollection 
  } = useCollections(user?.id)

  const [remixModalOpen, setRemixModalOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [newFolderModalOpen, setNewFolderModalOpen] = useState(false)
  const [selectedWork, setSelectedWork] = useState<any>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState("")
  
  const { address } = useAccount()

  // 使用数据库的文件夹，如果没有则使用 props
  const folders = dbFolders.length > 0 ? dbFolders.map(f => f.name) : propFolders

  // 转换数据库收藏为组件需要的格式
  const collectedWorks = collections.map((c: any) => ({
    id: c.works.work_id,
    title: c.works.title,
    author: c.works.creator_address.slice(0, 6) + '...' + c.works.creator_address.slice(-4),
    image: c.works.image_url,
    tags: c.works.tags || [],
    material: c.works.material?.join(', ') || '',
    likes: 0,
    allowRemix: c.works.allow_remix,
    isRemix: c.works.is_remix,
    story: c.works.story || c.works.description || '',
    licenseFee: c.works.license_fee || '0.05',
    savedAt: new Date(c.saved_at).toLocaleString(),
    savedFolder: c.folders.name,
    collectionStatus: authStatuses[c.works.work_id] || 'none',
  }))

  // Group works by folder
  const worksByFolder: Record<string, any[]> = {}
  collectedWorks.forEach((w) => {
    const folder = w.savedFolder || "Unsorted"
    if (!worksByFolder[folder]) worksByFolder[folder] = []
    worksByFolder[folder].push(w)
  })

  // Ensure all folders exist in the view even if empty
  folders.forEach((f) => {
    if (!worksByFolder[f]) worksByFolder[f] = []
  })

  const handlePayAndMint = async () => {
    if (!selectedWork || !address || !user) return

    setPaymentLoading(true)
    setPaymentError("")

    try {
      // 1. 创建授权请求（pending 状态）
      console.log("Creating authorization request...")
      await createAuthorizationRequest(address, selectedWork.id)
      
      // 2. 调用合约支付
      console.log("Processing payment...")
      const txHash = await requestAuthorization(
        BigInt(selectedWork.id),
        selectedWork.licenseFee || "0.05"
      )
      
      // 3. 更新状态为 approved
      console.log("Updating authorization status...")
      await updateAuthorizationStatus(
        address,
        selectedWork.id,
        'approved',
        txHash
      )
      
      console.log("Authorization granted successfully!")
      setRemixModalOpen(false)
      
      // 刷新数据
      window.location.reload() // 简单的刷新，实际应该调用 refetch
      
    } catch (error) {
      console.error("Authorization failed:", error)
      
      // 更新状态为 failed
      try {
        await updateAuthorizationStatus(
          address,
          selectedWork.id,
          'failed',
          undefined,
          error instanceof Error ? error.message : "Payment failed"
        )
      } catch (updateError) {
        console.error("Failed to update status:", updateError)
      }
      
      setPaymentError(error instanceof Error ? error.message : "Payment failed. Please try again.")
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleRemixClick = (work: any) => {
    if (!work.allowRemix) {
      return // Button should be disabled, but just in case
    }
    if (work.collectionStatus === "approved") {
      setSelectedWork(work)
      setUploadModalOpen(true)
    } else {
      setSelectedWork(work)
      setRemixModalOpen(true)
    }
  }

  const handleUnsave = async (workId: number) => {
    try {
      await removeCollection(workId)
      onUnsave(workId) // 通知父组件
    } catch (error) {
      console.error('Failed to unsave work:', error)
    }
  }

  const handleCreateFolder = async (name: string) => {
    try {
      await addFolder(name)
      propOnCreateFolder(name) // 通知父组件
    } catch (error) {
      console.error('Failed to create folder:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading collections...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">My Collections</h2>
          <p className="text-muted-foreground text-sm">Works you've saved for inspiration or remixing.</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setNewFolderModalOpen(true)}>
          <Folder className="w-4 h-4" />
          New Folder
        </Button>
      </div>

      <div className="space-y-10">
        {Object.entries(worksByFolder).map(
          ([folder, folderWorks]) =>
            folderWorks.length > 0 && (
              <div key={folder} className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Folder className="w-4 h-4 text-primary" /> {folder}
                  <span className="text-xs text-muted-foreground font-normal ml-2">({folderWorks.length})</span>
                </h3>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {folderWorks.map((work) => (
                    <WorkCard
                      key={work.id}
                      work={work}
                      isRemixable={true}
                      status={work.collectionStatus as any}
                      onRemix={() => handleRemixClick(work)}
                      showSavedDate={true}
                      onUnsave={() => handleUnsave(work.id)}
                    />
                  ))}
                </div>
              </div>
            ),
        )}
        {collectedWorks.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p>No collections yet. Go to Square to discover and collect works!</p>
          </div>
        )}
      </div>

      {/* Remix Application Modal */}
      <Dialog open={remixModalOpen} onOpenChange={setRemixModalOpen}>
        <DialogContent className="max-w-sm sm:max-w-md bg-background/95 backdrop-blur-xl border-primary/20">
          <DialogHeader>
            <DialogTitle>Apply for Remix License</DialogTitle>
            <DialogDescription>Create a derivative work based on "{selectedWork?.title}".</DialogDescription>
          </DialogHeader>

          {selectedWork?.collectionStatus === "rejected" && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-md text-sm text-red-500">
              Previous application rejected: Insufficient balance. Please top up and try again.
            </div>
          )}

          <div className="space-y-6 py-4">
            {/* Existing header */}
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50 flex items-center gap-3">
              <div className="w-12 h-12 bg-background rounded-md overflow-hidden border border-border">
                <img src={selectedWork?.image || "/placeholder.svg"} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-sm">{selectedWork?.title}</p>
                <p className="text-xs text-muted-foreground">Original by {selectedWork?.author}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Remix Type</Label>
              <Select defaultValue="reprocess">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reprocess">Reprocess (New Material)</SelectItem>
                  <SelectItem value="remake">Remake (Visual Interpretation)</SelectItem>
                  <SelectItem value="mix">Mix (Combined with other works)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>License Fee</Label>
              <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-muted/20">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-sm font-mono">
                  {selectedWork?.licenseFee || '0.05'} ETH
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                This fee will be paid to the original creator
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              disabled={paymentLoading}
              onClick={handlePayAndMint}
            >
              <GitFork className="w-4 h-4 mr-2" /> 
              {paymentLoading ? "Processing..." : "Pay & Mint License"}
            </Button>
            {paymentError && (
              <p className="text-red-500 text-sm mt-2">{paymentError}</p>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Modal */}
      <NewFolderModal
        open={newFolderModalOpen}
        onOpenChange={setNewFolderModalOpen}
        onCreate={(name: string) => {
          handleCreateFolder(name)
          setNewFolderModalOpen(false)
        }}
      />

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-primary/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Remix Work</DialogTitle>
            <DialogDescription>Upload your remixed version of "{selectedWork?.title}"</DialogDescription>
          </DialogHeader>
          <UploadWorkForm onClose={() => setUploadModalOpen(false)} sourceWork={selectedWork} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function NewFolderModal({ open, onOpenChange, onCreate }: any) {
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")

  const handleCreate = () => {
    if (name) {
      if (onCreate) onCreate(name)
      setName("")
      setDesc("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Folder Name</Label>
            <Input placeholder="e.g. Project Alpha" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="What's this collection for?"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreate}>Create Folder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function UploadWorkForm({ onClose, sourceWork }: { onClose: () => void; sourceWork: any }) {
  const [formData, setFormData] = useState({
    title: "",
    story: "",
    material: [] as string[],
    keywords: [] as string[],
  })

  const [materialInput, setMaterialInput] = useState("")
  const [keywordInput, setKeywordInput] = useState("")

  const commonMaterials = ["Clay", "Wood", "Metal", "Glass", "Fabric"]
  const commonKeywords = ["abstract", "modern", "traditional", "digital", "organic"]

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          placeholder="Name your work"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Upload Images/Video</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Story</Label>
        <Textarea
          placeholder="Tell the story behind your work"
          value={formData.story}
          onChange={(e) => setFormData({ ...formData, story: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Material</Label>
        <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-background min-h-[60px]">
          {formData.material.map((mat) => (
            <span
              key={mat}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
            >
              {mat}
              <button
                onClick={() => setFormData({ ...formData, material: formData.material.filter((m) => m !== mat) })}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Type and press Enter"
            className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
            value={materialInput}
            onChange={(e) => setMaterialInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && materialInput.trim()) {
                setFormData({ ...formData, material: [...formData.material, materialInput.trim()] })
                setMaterialInput("")
              }
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {commonMaterials.map((mat) => (
            <button
              key={mat}
              onClick={() => {
                if (!formData.material.includes(mat)) {
                  setFormData({ ...formData, material: [...formData.material, mat] })
                }
              }}
              className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
            >
              + {mat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Inspiration Keywords</Label>
        <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-background min-h-[60px]">
          {formData.keywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
            >
              {kw}
              <button onClick={() => setFormData({ ...formData, keywords: formData.keywords.filter((k) => k !== kw) })}>
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Type and press Enter"
            className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && keywordInput.trim()) {
                setFormData({ ...formData, keywords: [...formData.keywords, keywordInput.trim()] })
                setKeywordInput("")
              }
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {commonKeywords.map((kw) => (
            <button
              key={kw}
              onClick={() => {
                if (!formData.keywords.includes(kw)) {
                  setFormData({ ...formData, keywords: [...formData.keywords, kw] })
                }
              }}
              className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
            >
              + {kw}
            </button>
          ))}
        </div>
      </div>

      <Button className="w-full" onClick={onClose}>
        Upload & Mint
      </Button>
    </div>
  )
}
