'use client'

import dynamic from 'next/dynamic'

const WhichwitchApp = dynamic(
  () => import('@/components/whichwitch/app-container').then(mod => ({ default: mod.WhichwitchApp })),
  { ssr: false }
)

export default function Page() {
  return <WhichwitchApp />
}
