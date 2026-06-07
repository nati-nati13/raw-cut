import Link from 'next/link'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface DesignerCardProps {
  designer: {
    _id: string
    name: string
    username: string
    storeName?: string
    bio?: string
    avatar?: string
  }
}

export function DesignerCard({ designer }: DesignerCardProps) {
  const displayName = designer.storeName ?? designer.name

  return (
    <Link href={`/designers/${designer.username}`} className="group flex flex-col items-center text-center gap-2">
      <Avatar className="h-16 w-16 group-hover:ring-2 ring-black ring-offset-2 transition-all">
        <AvatarImage src={designer.avatar ?? ''} alt={displayName} />
        <AvatarFallback className="text-lg font-semibold">
          {displayName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium group-hover:underline">{displayName}</p>
        <p className="text-xs text-gray-400">@{designer.username}</p>
      </div>
    </Link>
  )
}
