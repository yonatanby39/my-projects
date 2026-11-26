import type { ReactNode } from 'react'

export function Prompt({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-bold text-slate-700">{title}</h2>
      {children}
    </div>
  )
}
