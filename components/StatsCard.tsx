import { Typography } from "aspect-ui/Typography"
import { memo } from "react"

interface StatsCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
}

const StatsCard = memo(function StatsCard ({ icon, value, label }: StatsCardProps) {
  return (
    <div className="relative">
      {icon}
      <div className="bg-primary-200/30 dark:bg-primary-950/30 rounded-lg shadow p-6">
        <Typography variant="body1" className="text-primary-900 mb-4">{label}</Typography>
        <Typography variant="h3" className="text-primary-900">{value}</Typography>
      </div>
    </div>
  )
})

export default StatsCard