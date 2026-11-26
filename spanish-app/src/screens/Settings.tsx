import { useEffect, useState } from 'react'
import { loadVoices, pickVoice, speak, speechSupported, spanishVoices } from '../lib/speech'

interface Props {
  voiceURI: string | null
  soundOn: boolean
  onChangeSound: (on: boolean) => void
  onChangeVoice: (voiceURI: string | null) => void
  onBack: () => void
}

const SAMPLE = '¡Hola, che! ¿Cómo andás? Vos tenés razón.'

export function Settings({ voiceURI, soundOn, onChangeSound, onChangeVoice, onBack }: Props) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let alive = true
    void loadVoices().then((all) => {
      if (!alive) return
      setVoices(spanishVoices(all))
      setLoaded(true)
    })
    return () => {
      alive = false
    }
  }, [])

  const auto = pickVoice(voices)
  const hasArgentine = voices.some((v) => v.lang.toLowerCase().replace('_', '-') === 'es-ar')

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-5 p-6">
      <header className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="חזרה"
          className="h-12 w-12 shrink-0 rounded-full bg-white text-xl shadow-sm active:scale-95"
        >
          →
        </button>
        <h1 className="text-2xl font-bold">הגדרות</h1>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">קול להגייה</h2>
        {!speechSupported() ? (
          <p className="text-slate-600">הדפדפן הזה לא תומך בהקראה.</p>
        ) : !loaded ? (
          <p className="text-slate-500">טוען קולות…</p>
        ) : voices.length === 0 ? (
          <p className="text-slate-600">לא נמצא קול ספרדי במכשיר. אפשר להתקין קול ספרדי בהגדרות ההקראה של הטלפון.</p>
        ) : (
          <>
            {!hasArgentine && (
              <p className="text-sm text-slate-500">אין במכשיר קול ארגנטינאי, אז ברירת המחדל היא הקול הלטינו-אמריקאי הקרוב ביותר.</p>
            )}
            <div className="flex flex-col gap-2">
              <VoiceOption
                label={`אוטומטי${auto ? ` (${auto.name})` : ''}`}
                selected={voiceURI === null}
                onSelect={() => onChangeVoice(null)}
              />
              {voices.map((v) => (
                <VoiceOption
                  key={v.voiceURI}
                  label={v.name}
                  lang={v.lang}
                  selected={voiceURI === v.voiceURI}
                  onSelect={() => onChangeVoice(v.voiceURI)}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => void speak(SAMPLE, voiceURI)}
              className="min-h-14 rounded-2xl bg-sky-500 text-lg font-semibold text-white shadow active:scale-[0.98]"
            >
              🔊 השמע דוגמה
            </button>
          </>
        )}
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <label className="flex min-h-12 items-center justify-between gap-3">
          <span className="text-lg font-semibold">צלילים לתשובה נכונה ושגויה</span>
          <input
            type="checkbox"
            checked={soundOn}
            onChange={(e) => onChangeSound(e.target.checked)}
            className="h-7 w-7 accent-orange-500"
          />
        </label>
      </section>

      <section className="rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-slate-800">התקנה בטלפון</h2>
        <p>אנדרואיד (Chrome): תפריט ⋮ ואז "הוספה למסך הבית" או "התקנת אפליקציה".</p>
        <p className="mt-1">אייפון (Safari): כפתור השיתוף ואז "הוסף למסך הבית".</p>
        <p className="mt-1">אחרי ההתקנה האפליקציה עובדת גם בלי אינטרנט. ההתקדמות נשמרת במכשיר הזה בלבד.</p>
      </section>
    </main>
  )
}

function VoiceOption({ label, lang, selected, onSelect }: { label: string; lang?: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex min-h-12 items-center justify-between gap-2 rounded-xl border-2 px-3 text-start ${
        selected ? 'border-sky-500 bg-sky-50' : 'border-slate-100 bg-white'
      }`}
    >
      <span dir="auto">{label}</span>
      {lang && <span className="text-xs text-slate-500" dir="ltr">{lang}</span>}
    </button>
  )
}
