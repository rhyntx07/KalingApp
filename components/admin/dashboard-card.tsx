import { LucideIcon } from 'lucide-react'

interface DashboardCardProps {
  title: string
  value: string
  icon: LucideIcon
  color: string
  description: string
}

export default function DashboardCard({
  title,
  value,
  icon: Icon,
  color,
  description,
}: DashboardCardProps) {
  const colorClasses = {
    primary: 'bg-light-pink text-primary',
    secondary: 'bg-light-pink text-primary',
    accent: 'bg-[#FDF6E2] text-accent',
    destructive: 'bg-destructive/10 text-destructive',
  }

  const bgColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.primary

  return (
    <div className="bg-white rounded-[18px] border border-border p-6 hover:border-primary/50 transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}
