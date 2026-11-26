import type { Gender } from '../lib/content'

export function GenderBadge({ gender }: { gender?: Gender }) {
  if (!gender) return null
  const masc = gender === 'm'
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${masc ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}
    >
      {masc ? 'זכר' : 'נקבה'}
    </span>
  )
}
