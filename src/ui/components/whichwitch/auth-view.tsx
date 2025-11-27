"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Wallet, Sparkles, X } from "lucide-react"
import type { UserProfile } from "./app-container"
import { Badge } from "@/components/ui/badge"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { useUser } from "@/lib/hooks/useUser"

export function AuthView({ onLogin }: { onLogin: (user: UserProfile) => void }) {
  const [step, setStep] = useState<"welcome" | "profile">("welcome")
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    skills: [] as string[],
  })
  const [skillInput, setSkillInput] = useState("")
  const [error, setError] = useState<string | null>(null)

  // 真实的钱包连接和用户数据
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { user, isNewUser, registerUser, loading: userLoading } = useUser()

  const commonSkills = ["Ceramics", "Woodworking", "Digital Art", "Embroidery", "Pottery", "3D Modeling"]

  // 当钱包连接成功后，检查用户状态
  useEffect(() => {
    if (isConnected && address && !userLoading) {
      // 只有在用户数据加载完成后才进行判断
      if (user) {
        // 老用户，标记为自动登录中，延迟 1.5 秒后自动登录
        setIsAutoLoggingIn(true)
        setTimeout(() => {
          onLogin({
            did: `did:whichwitch:${address}`,
            name: user.name,
            bio: user.bio || "",
            skills: user.skills || [],
          })
        }, 1500)
      } else if (isNewUser && step === "welcome" && !isAutoLoggingIn) {
        // 新用户，且不是自动登录中，显示注册表单
        setStep("profile")
      }
    }
  }, [isConnected, address, user, isNewUser, step, userLoading, isAutoLoggingIn])

  const handleConnect = () => {
    // 使用第一个可用的连接器（通常是 MetaMask）
    if (connectors.length > 0) {
      connect({ connector: connectors[0] })
    }
  }

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) return
    
    setError(null)
    
    try {
      // 创建用户并初始化默认文件夹
      const newUser = await registerUser({
        name: formData.name || "Anonymous Artisan",
        bio: formData.bio || "Digital Craftsman",
        skills: formData.skills,
      })

      // 登录
      onLogin({
        did: `did:whichwitch:${address}`,
        name: newUser.name,
        bio: newUser.bio || "",
        skills: newUser.skills || [],
      })
    } catch (err) {
      console.error('Error creating profile:', err)
      setError('Failed to create profile. Please try again.')
    }
  }

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] })
    }
    setSkillInput("")
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill(skillInput.trim())
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="w-60 h-60 mx-auto relative">
            <Image src="/logos/whichwitch-logo.jpg" alt="Whichwitch Logo" fill className="object-contain" />
          </div>
          <h1 className="text-5xl font-bold tracking-tighter text-[#5DADE2]">Whichwitch</h1>
          <p className="text-muted-foreground">
            Establish on-chain identity for your craft. Trace inspiration, protect rights, and get rewarded.
          </p>
        </div>

        {step === "welcome" || userLoading || isAutoLoggingIn ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid gap-4">
              <Button
                size="lg"
                className="w-full h-14 text-lg font-medium relative overflow-hidden group"
                onClick={handleConnect}
                disabled={isPending || isConnected || userLoading}
              >
                {(isPending || userLoading) ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Wallet className="mr-2 h-5 w-5" />
                )}
                {userLoading ? 'Loading user data...' : isConnected ? 'Wallet Connected' : 'Connect Wallet'}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Button>
              {isConnected && address && (
                <p className="text-center text-sm text-muted-foreground font-mono">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              )}
            </div>
            <p className="text-center text-xs text-muted-foreground">
              By connecting, you agree to our Terms of Service and Protocol Rules.
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleCreateProfile}
            className="space-y-6 bg-card border border-border/50 p-6 rounded-xl"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Create Identity</h2>
              <p className="text-sm text-muted-foreground">Set up your artisan profile on the genealogy tree.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Studio Ghibli"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  placeholder="Tell your story..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="skills">Skills</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="h-7 pl-2 pr-1 flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:bg-background/50 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="space-y-3">
                  <Input
                    id="skills"
                    placeholder="Type a skill and press Enter..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <div className="flex flex-wrap gap-2">
                    
                    {commonSkills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => addSkill(skill)}
                        disabled={formData.skills.includes(skill)}
                        className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                          formData.skills.includes(skill)
                            ? "opacity-50 cursor-not-allowed bg-muted"
                            : "hover:bg-secondary hover:text-secondary-foreground cursor-pointer"
                        }`}
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-12" disabled={userLoading}>
              {userLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  Create Profile <Sparkles className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </motion.form>
        )}
      </div>
    </div>
  )
}
