import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <div className="text-5xl">⏳</div>
        <h1 className="text-2xl font-bold">Application under review</h1>
        <p className="text-gray-500">
          Your designer application is being reviewed by our team. This usually takes 1–2 business
          days. We will email you once your account is approved.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Browse the marketplace</Link>
        </Button>
      </div>
    </div>
  )
}
