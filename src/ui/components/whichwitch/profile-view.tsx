"use client"

import { useState, useEffect } from "react"
import type { UserProfile } from "./app-container"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { WorkCard } from "./work-card"
import { Settings, Share2, Wallet, ArrowUpRight, RefreshCw } from "lucide-react"
import { WorkDetailDialog } from "./work-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAccount } from "wagmi"
import { formatEther } from "viem"
import { useUser } from "@/lib/hooks/useUser"
import { useWorks } from "@/lib/hooks/useWorks"
import { getCreatorRevenue } from "@/lib/web3/services/contract.service"

export function ProfileView({ user }: { user: UserProfile }) {
  const { address } = useAccount()
  const { user: dbUser } = useUser()
  const { works, loading: worksLoading } = useWorks(address)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [balance, setBalance] = useState("0")
  const [loadingBalance, setLoadingBalance] = useState(true)
  const [withdrawing, setWithdrawing] = useState(false)

  useEffect(() => {
    if (address) {
      loadBalance()
    }
  }, [address])

  const loadBalance = async () => {
    if (!address) return
    
    setLoadingBalance(true)
    try {
      const revenue = await getCreatorRevenue(address)
      setBalance(formatEther(revenue))
    } catch (error) {
      console.error("Error loading balance:", error)
      setBalance("0")
    } finally {
      setLoadingBalance(false)
    }
  }

  const handleWithdraw = async () => {
    if (!address || parseFloat(balance) === 0) return
    
    setWithdrawing(true)
    try {
      const { withdrawRevenue } = await import("@/lib/web3/services/contract.service")
      await withdrawRevenue()
      
      // 刷新余额
      await loadBalance()
      
      alert("Withdrawal successful!")
    } catch (error) {
      console.error("Withdrawal failed:", error)
      alert(`Withdrawal failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setWithdrawing(false)
    }
  }

  // 转换数据库作品格式为组件需要的格式
  const transformedWorks = works.map((work: any) => ({
    id: work.work_id,
    title: work.title,
    author: work.creator_address?.slice(0, 6) + '...' + work.creator_address?.slice(-4),
    image: work.image_url,
    images: work.images,
    tags: work.tags || [],
    material: work.material?.join(', ') || '',
    likes: work.like_count || 0,
    remixCount: work.remix_count || 0,
    allowRemix: work.allow_remix,
    isRemix: work.is_remix,
    story: work.story || work.description || '',
    createdAt: work.created_at,
  }))

  const myWorks = transformedWorks.filter((w) => !w.isRemix)
  const myRemixes = transformedWorks.filter((w) => w.isRemix)

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/50 to-muted/10 border border-border/50 p-6 md:p-8 md:px-6 md:py-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-10 -mt-10" />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
            {/* Left: User Info */}
            <div className="flex gap-6 items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-2xl shadow-primary/20 border-4 border-background shrink-0">
                {user.name.charAt(0)}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-mono border border-primary/20">
                    {dbUser ? `Platform ID: ${dbUser.platform_id}` : `DID: ${user.did.slice(0, 12)}...`}
                  </span>
                </div>

                <p className="text-muted-foreground max-w-md text-sm">{user.bio}</p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {user.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-muted text-foreground rounded-full text-[10px] font-medium border border-border"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 items-end">
              <div className="flex items-center gap-4 bg-primary/5 rounded-xl p-4 min-w-[240px]">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Balance</p>
                      <button
                        onClick={loadBalance}
                        disabled={loadingBalance}
                        className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${loadingBalance ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    <p className="text-xl font-mono font-bold">
                      {loadingBalance ? "Loading..." : (() => {
                        const bal = parseFloat(balance)
                        if (bal === 0) return '0 ETH'
                        if (bal < 0.0001) return `${bal.toExponential(4)} ETH`
                        if (bal < 0.01) return `${bal.toFixed(6)} ETH`
                        return `${bal.toFixed(4)} ETH`
                      })()}
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="gap-2 h-8 shrink-0"
                  onClick={handleWithdraw}
                  disabled={loadingBalance || parseFloat(balance) === 0 || withdrawing}
                >
                  <ArrowUpRight className="w-4 h-4" /> {withdrawing ? "Processing..." : "Withdraw"}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent h-8"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings className="w-4 h-4" /> Settings
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent h-8">
                  <Share2 className="w-4 h-4" /> Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Works Tabs */}
      <Tabs defaultValue="originals" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex">
          <TabsTrigger value="originals">Originals</TabsTrigger>
          <TabsTrigger value="remixes">Remixes</TabsTrigger>
        </TabsList>

        <TabsContent value="originals" className="space-y-4 mt-6">
          {worksLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading works...</div>
          ) : myWorks.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {myWorks.map((work) => (
                <WorkDetailTrigger key={work.id} work={work} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No original works yet</div>
          )}
        </TabsContent>

        <TabsContent value="remixes" className="space-y-4 mt-6">
          {worksLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading remixes...</div>
          ) : myRemixes.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {myRemixes.map((work) => (
                <WorkDetailTrigger key={work.id} work={work} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No remixes yet</div>
          )}
        </TabsContent>
      </Tabs>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} user={user} />
    </div>
  )
}

function WorkDetailTrigger({ work }: { work: any }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <WorkCard 
        work={work} 
        onClick={() => setOpen(true)}
      />
      <WorkDetailDialog work={work} open={open} onOpenChange={setOpen} />
    </>
  )
}

function SettingsModal({
  open,
  onOpenChange,
  user,
}: { open: boolean; onOpenChange: (open: boolean) => void; user: UserProfile }) {
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio,
    skills: user.skills,
  })

  const [skillInput, setSkillInput] = useState("")
  const commonSkills = ["Ceramics", "Woodworking", "Digital Art", "Sculpture", "Weaving", "Metalwork"]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-background min-h-[60px]">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                >
                  {skill}
                  <button
                    onClick={() => setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) })}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Press Enter to add"
                className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && skillInput.trim()) {
                    setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] })
                    setSkillInput("")
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {commonSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => {
                    if (!formData.skills.includes(skill)) {
                      setFormData({ ...formData, skills: [...formData.skills, skill] })
                    }
                  }}
                  className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
