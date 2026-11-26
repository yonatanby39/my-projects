import type { PersonKey, Verb } from '../lib/content'
import { persons } from '../lib/content'
import { Es } from './Es'

/** The full present-tense table of a verb, highlighting one person. */
export function VerbTable({ verb, highlight }: { verb: Verb; highlight?: PersonKey }) {
  return (
    <table className="w-full text-left" dir="ltr">
      <tbody>
        {persons.map((p) => (
          <tr key={p.key} className={p.key === highlight ? 'bg-orange-100 font-bold' : ''}>
            <td className="px-2 py-1 text-slate-500">
              <Es>{p.es}</Es>
            </td>
            <td className="px-2 py-1 text-lg">
              <Es>{verb.present[p.key]}</Es>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
