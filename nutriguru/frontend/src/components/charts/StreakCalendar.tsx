interface DayData {
  date: string
  completed: boolean
}

interface Props {
  data: DayData[]
}

export default function StreakCalendar({ data }: Props) {
  return (
    <div className="bg-surface-0 rounded-xl border border-border p-5">
      <h3 className="text-sm font-bold mb-4">Meal Completion Streak</h3>
      <div className="flex flex-wrap gap-1">
        {data.map((d) => (
          <div
            key={d.date}
            title={`${d.date}: ${d.completed ? 'Completed' : 'Missed'}`}
            className={`w-5 h-5 rounded-sm ${d.completed ? 'bg-success' : 'bg-surface-2'}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3 text-[10px] text-text-muted">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-surface-2" /> Missed</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-success" /> Completed</span>
      </div>
    </div>
  )
}
