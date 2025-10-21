"use client"

import { useState } from "react"
import { useWalletConnection } from "@/lib/hooks/use-wallet"
import { qrAPI } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

export default function ScanPage() {
  const { connected, publicKey } = useWalletConnection()
  const [qrData, setQrData] = useState("")
  const [loading, setLoading] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const { toast } = useToast()

  const handleVerifyQR = async () => {
    if (!qrData || !publicKey) {
      toast({
        title: "Error",
        description: "Please provide QR data and connect wallet",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await qrAPI.verify({
        qrData,
        attendeeWallet: publicKey,
      })
      setVerificationResult(response.data)
      toast({
        title: "Success",
        description: response.data.message,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to verify QR",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!connected) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-foreground-muted">Please connect your wallet to scan QR codes</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Scan Event QR Code</h1>

      <div className="card space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">QR Code Data</label>
          <textarea
            className="input-field"
            placeholder="Paste QR code data here"
            value={qrData}
            onChange={(e) => setQrData(e.target.value)}
            rows={6}
          />
        </div>

        <button onClick={handleVerifyQR} disabled={loading || !qrData} className="btn-primary w-full">
          {loading ? "Verifying..." : "Verify QR Code"}
        </button>

        {verificationResult && (
          <div className="bg-surface-light rounded-lg p-4 border border-primary">
            <h3 className="font-semibold mb-3">Verification Result</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-foreground-muted">Event:</span> {verificationResult.eventName}
              </p>
              <p>
                <span className="text-foreground-muted">Status:</span>{" "}
                <span className="text-primary">{verificationResult.valid ? "Valid" : "Invalid"}</span>
              </p>
              <p>
                <span className="text-foreground-muted">Ready to Mint:</span>{" "}
                <span className="text-primary">{verificationResult.canMint ? "Yes" : "No"}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
