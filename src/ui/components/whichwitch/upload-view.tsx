"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { UserProfile } from "./app-container"
import { UploadCloud, CheckCircle2, X } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useAccount } from "wagmi"
import { uploadFileToPinata, createAndUploadMetadata } from "@/lib/ipfs/pinata.service"
import { registerOriginalWork, registerDerivativeWork } from "@/lib/web3/services/contract.service"
import { createWork } from "@/lib/supabase/services"
import { useCollections } from "@/lib/hooks/useCollections"
import { useUser } from "@/lib/hooks/useUser"

export function UploadView({ 
  user, 
  isRemix = false, 
  onAddWork,
  preselectedParentWorkId,
  onClearPreselection,
}: { 
  user: UserProfile; 
  isRemix?: boolean;
  onAddWork?: (work: any) => void;
  preselectedParentWorkId?: number | null;
  onClearPreselection?: () => void;
}) {
  const { address } = useAccount()
  const { user: dbUser } = useUser()
  const { collections, authStatuses } = useCollections(dbUser?.id)
  
  const [mode, setMode] = useState<"original" | "remix">(preselectedParentWorkId ? "remix" : "original")
  const [selectedParentWork, setSelectedParentWork] = useState<number | null>(preselectedParentWorkId || null)
  
  // 当预选的 parent work 改变时更新状态
  useEffect(() => {
    if (preselectedParentWorkId) {
      setMode("remix")
      setSelectedParentWork(preselectedParentWorkId)
    }
  }, [preselectedParentWorkId])

  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [files, setFiles] = useState<File[]>([])
  const [allowRemix, setAllowRemix] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [materialTags, setMaterialTags] = useState<string[]>([])
  const [currentMaterial, setCurrentMaterial] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  
  // Form data
  const [formData, setFormData] = useState({
    title: "",
    story: "",
    licenseFee: "0.05"
  })

  const SUGGESTED_TAGS = ["Cyberpunk", "Minimalist", "Nature", "Abstract", "Surreal"]
  const SUGGESTED_MATERIALS = ["Digital", "Wood", "Clay", "Glass", "Metal"]

  // Get approved works from collections
  const approvedWorks = collections?.filter(c => 
    authStatuses[c.work_id] === 'approved' && c.work?.allowRemix
  ) || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0 || !address) return
    if (mode === "remix" && !selectedParentWork) return

    setStatus("uploading")
    setErrorMessage("")

    try {
      // 1. 上传所有图片到 IPFS
      console.log("Uploading images to IPFS...")
      const imageHashes = await Promise.all(files.map(file => uploadFileToPinata(file)))
      const imageUrls = imageHashes.map(hash => `https://gateway.pinata.cloud/ipfs/${hash}`)
      const imageUrl = imageUrls[0] // 主图片
      
      // 2. 创建并上传 metadata
      console.log("Creating metadata...")
      const metadataHash = await createAndUploadMetadata({
        title: formData.title,
        description: formData.story,
        story: formData.story,
        imageHash: imageHashes[0],
        images: imageUrls,
        material: materialTags,
        tags: tags,
        creator: address,
        parentWorkId: mode === "remix" ? selectedParentWork : undefined,
      })
      const metadataUri = `ipfs://${metadataHash}`
      
      // 3. 调用合约注册作品
      console.log("Registering work on blockchain...")
      let contractResult
      if (mode === "remix" && selectedParentWork) {
        contractResult = await registerDerivativeWork(
          BigInt(selectedParentWork),
          formData.licenseFee,
          allowRemix,
          metadataUri
        )
      } else {
        contractResult = await registerOriginalWork(
          formData.licenseFee,
          allowRemix,
          metadataUri
        )
      }
      
      // 4. 保存到数据库
      console.log("Saving to database...")
      console.log("Work ID from contract:", contractResult.workId.toString())
      
      const newWork = await createWork({
        workId: Number(contractResult.workId),
        creatorAddress: address,
        title: formData.title,
        description: formData.story,
        imageUrl: imageUrl,
        images: imageUrls,
        metadataUri: metadataUri,
        material: materialTags,
        tags: tags,
        allowRemix: allowRemix,
        licenseFee: formData.licenseFee,
        isRemix: mode === "remix",
        parentWorkId: mode === "remix" ? selectedParentWork : null,
      })
      
      console.log("Work uploaded successfully!")
      setStatus("success")
      
      // 通知父组件
      if (onAddWork) {
        onAddWork(newWork)
      }
      
    } catch (error) {
      console.error("Upload failed:", error)
      setErrorMessage(error instanceof Error ? error.message : "Upload failed. Please try again.")
      setStatus("error")
    }
  }

  const addTag = (val: string, list: string[], setList: any, currentSetter: any) => {
    if (val.trim() && !list.includes(val.trim())) {
      setList([...list, val.trim()])
      currentSetter("")
    }
  }

  const removeTag = (tagToRemove: string, list: string[], setList: any) => {
    setList(list.filter((tag) => tag !== tagToRemove))
  }

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6"
      >
        <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{mode === "remix" ? "Remix Uploaded!" : "Work Minted Successfully!"}</h2>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Your work has been recorded on the blockchain and added to the genealogy tree.
          </p>
        </div>
        <Button onClick={() => {
          setStatus("idle")
          setFiles([])
          setFormData({ title: "", story: "", licenseFee: "0.05" })
          setTags([])
          setMaterialTags([])
          setSelectedParentWork(null)
          if (onClearPreselection) onClearPreselection()
        }} className="w-full max-w-xs">
          Upload Another
        </Button>
      </motion.div>
    )
  }

  if (status === "error") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6"
      >
        <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center">
          <X className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Upload Failed</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {errorMessage}
          </p>
        </div>
        <Button onClick={() => setStatus("idle")} className="w-full max-w-xs">
          Try Again
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center p-1 bg-muted rounded-lg w-full">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === "original" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setMode("original")}
          >
            Original Work
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === "remix" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setMode("remix")}
          >
            Remix Work
          </button>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{mode === "remix" ? "Upload Remix" : "Upload Original Work"}</h2>
          <p className="text-muted-foreground text-sm">
            {mode === "remix"
              ? "Select an approved parent work and upload your derivative."
              : "Register your creation to the genealogy tree."}
          </p>
        </div>
      </div>

      {mode === "remix" && (
        <div className="space-y-4 p-4 border rounded-xl bg-muted/20">
          <div>
            <Label className="text-base">Select Parent Work</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Choose the original work you want to create a derivative from
            </p>
          </div>
          
          {/* Selected Parent Work Display */}
          {selectedParentWork && approvedWorks.find(w => w.work_id === selectedParentWork) && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-xs font-medium text-primary mb-2">Selected Parent Work:</p>
              <div className="flex gap-3 items-center">
                <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  <img 
                    src={approvedWorks.find(w => w.work_id === selectedParentWork)?.work?.imageUrl || "/placeholder.svg"} 
                    className="w-full h-full object-cover" 
                    alt="Parent work"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {approvedWorks.find(w => w.work_id === selectedParentWork)?.work?.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by {approvedWorks.find(w => w.work_id === selectedParentWork)?.work?.creator?.slice(0, 6)}...
                    {approvedWorks.find(w => w.work_id === selectedParentWork)?.work?.creator?.slice(-4)}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {approvedWorks.find(w => w.work_id === selectedParentWork)?.work?.material?.slice(0, 2).map((mat: string) => (
                      <span key={mat} className="text-[10px] px-1.5 py-0.5 bg-background rounded">
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedParentWork(null)}
                  className="flex-shrink-0"
                >
                  Change
                </Button>
              </div>
            </div>
          )}
          
          {/* Parent Work Grid */}
          {!selectedParentWork && (
            <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
              {approvedWorks.length > 0 ? (
                approvedWorks.map((collection) => (
                  <div
                    key={collection.work_id}
                    onClick={() => setSelectedParentWork(collection.work_id)}
                    className="relative cursor-pointer group rounded-lg overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all"
                  >
                    <div className="aspect-square bg-muted">
                      <img src={collection.work?.imageUrl || "/placeholder.svg"} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2 bg-background/90">
                      <p className="text-xs font-medium truncate">{collection.work?.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {collection.work?.creator?.slice(0, 6)}...{collection.work?.creator?.slice(-4)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-8 text-center text-muted-foreground text-sm">
                  No approved works found in your collection. <br />
                  Go to Saved tab to apply for remix rights.
                </div>
              )}
            </div>
          )}
          
          {approvedWorks.length > 0 && !selectedParentWork && (
            <p className="text-xs text-red-500">⚠️ Please select a parent work to proceed.</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            files.length > 0 ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={(e) => {
              const newFiles = Array.from(e.target.files || [])
              setFiles(prev => [...prev, ...newFiles])
            }}
            accept="image/*,video/*"
            multiple
          />
          <label htmlFor="file-upload" className="cursor-pointer block">
            {files.length > 0 ? (
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {files.map((file, idx) => (
                    <div key={idx} className="relative group">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-primary/20">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setFiles(prev => prev.filter((_, i) => i !== idx))
                        }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Click to add more images</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="font-medium text-sm">Click to upload Images/Videos</p>
                <p className="text-xs text-muted-foreground">Multiple files supported • IPFS storage</p>
              </div>
            )}
          </label>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              placeholder="The Whispering Vase" 
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="story">The Story</Label>
            <Textarea
              id="story"
              placeholder="What inspired this piece? Share the origin..."
              className="min-h-[100px]"
              value={formData.story}
              onChange={(e) => setFormData(prev => ({ ...prev, story: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Material</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background focus-within:ring-1 focus-within:ring-ring">
              {materialTags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded"
                >
                  {tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag, materialTags, setMaterialTags)} />
                </span>
              ))}
              <input
                className="flex-1 bg-transparent border-none outline-none text-sm min-w-[100px]"
                placeholder="Type and enter (e.g. Clay)"
                value={currentMaterial}
                onChange={(e) => setCurrentMaterial(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), addTag(currentMaterial, materialTags, setMaterialTags, setCurrentMaterial))
                }
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_MATERIALS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag, materialTags, setMaterialTags, setCurrentMaterial)}
                  className="text-[10px] px-2 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Inspiration Keywords</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background focus-within:ring-1 focus-within:ring-ring">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded"
                >
                  #{tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag, tags, setTags)} />
                </span>
              ))}
              <input
                className="flex-1 bg-transparent border-none outline-none text-sm min-w-[100px]"
                placeholder="Type and enter..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag(currentTag, tags, setTags, setCurrentTag))
                }
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag, tags, setTags, setCurrentTag)}
                  className="text-[10px] px-2 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                >
                  # {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
            <div className="space-y-0.5">
              <Label className="text-base">Allow Remixing</Label>
              <p className="text-xs text-muted-foreground">Allow others to create derivative works</p>
            </div>
            <Switch checked={allowRemix} onCheckedChange={setAllowRemix} />
          </div>

          {allowRemix && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <Label>Licensing Fee (ETH)</Label>
              <Input 
                type="number" 
                step="0.01" 
                placeholder="0.05"
                value={formData.licenseFee}
                onChange={(e) => setFormData(prev => ({ ...prev, licenseFee: e.target.value }))}
              />
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-lg"
          disabled={files.length === 0 || !formData.title || status === "uploading" || (mode === "remix" && !selectedParentWork)}
        >
          {status === "uploading" ? "Minting..." : mode === "remix" ? "Mint Remix" : "Mint to Chain"}
        </Button>
      </form>
    </div>
  )
}
