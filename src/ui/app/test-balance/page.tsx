"use client"

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCreatorRevenue, processPayment } from '@/lib/web3/services/contract.service'
import { formatEther, parseEther } from 'viem'
import { CONTRACT_ADDRESSES } from '@/lib/web3/contracts/addresses'

export default function TestBalancePage() {
  const { address } = useAccount()
  const [balance, setBalance] = useState<string>('0')
  const [loading, setLoading] = useState(false)
  const [testAddress, setTestAddress] = useState('')
  const [workId, setWorkId] = useState('')
  const [tipAmount, setTipAmount] = useState('0.001')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
    console.log(message)
  }

  const checkBalance = async () => {
    const addr = testAddress || address
    if (!addr) {
      addLog('❌ No address provided')
      return
    }

    setLoading(true)
    addLog(`🔍 Checking balance for: ${addr}`)
    addLog(`📍 Contract: ${CONTRACT_ADDRESSES.payment}`)

    try {
      const revenue = await getCreatorRevenue(addr)
      const ethBalance = formatEther(revenue)
      setBalance(ethBalance)
      addLog(`✅ Balance: ${ethBalance} ETH (${revenue.toString()} wei)`)
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const sendTestTip = async () => {
    if (!workId || !tipAmount) {
      addLog('❌ Please provide work ID and tip amount')
      return
    }

    setLoading(true)
    addLog(`💸 Sending ${tipAmount} ETH tip to work ${workId}`)

    try {
      const txHash = await processPayment(BigInt(workId), tipAmount)
      addLog(`✅ Tip sent! TX: ${txHash}`)
      addLog('⏳ Waiting 2 seconds before checking balance...')
      
      setTimeout(() => {
        checkBalance()
      }, 2000)
    } catch (error) {
      addLog(`❌ Tip failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Balance Test Page</h1>

      {/* Contract Info */}
      <div className="mb-8 p-4 bg-muted rounded-lg">
        <h2 className="font-bold mb-2">Contract Addresses</h2>
        <div className="space-y-1 text-sm font-mono">
          <div>Payment: {CONTRACT_ADDRESSES.payment}</div>
          <div>Creation: {CONTRACT_ADDRESSES.creation}</div>
          <div>Authorization: {CONTRACT_ADDRESSES.authorization}</div>
        </div>
      </div>

      {/* Connected Account */}
      <div className="mb-8 p-4 bg-muted rounded-lg">
        <h2 className="font-bold mb-2">Connected Account</h2>
        <div className="text-sm font-mono">
          {address ? address : 'Not connected'}
        </div>
      </div>

      {/* Check Balance */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="font-bold mb-4">Check Balance</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm mb-2 block">Address (leave empty to use connected account)</label>
            <Input
              placeholder="0x..."
              value={testAddress}
              onChange={(e) => setTestAddress(e.target.value)}
            />
          </div>
          <Button onClick={checkBalance} disabled={loading}>
            {loading ? 'Loading...' : 'Check Balance'}
          </Button>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              Balance: {balance} ETH
            </div>
            {balance !== '0' && parseFloat(balance) > 0 && (
              <div className="text-sm text-muted-foreground font-mono">
                ({(parseFloat(balance) * 1e18).toFixed(0)} wei)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send Test Tip */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="font-bold mb-4">Send Test Tip</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm mb-2 block">Work ID</label>
            <Input
              placeholder="1"
              value={workId}
              onChange={(e) => setWorkId(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm mb-2 block">Tip Amount (ETH)</label>
            <Input
              placeholder="0.001"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
            />
          </div>
          <Button onClick={sendTestTip} disabled={loading || !address}>
            {loading ? 'Sending...' : 'Send Tip'}
          </Button>
        </div>
      </div>

      {/* Logs */}
      <div className="p-4 bg-black text-green-400 rounded-lg font-mono text-sm">
        <h2 className="font-bold mb-2 text-white">Console Logs</h2>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">No logs yet...</div>
          ) : (
            logs.map((log, i) => <div key={i}>{log}</div>)
          )}
        </div>
        <Button 
          onClick={() => setLogs([])} 
          variant="outline" 
          size="sm" 
          className="mt-2"
        >
          Clear Logs
        </Button>
      </div>
    </div>
  )
}
