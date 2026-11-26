import type { ReactNode } from 'react'

/** Wraps Spanish text so it renders LTR inside the RTL Hebrew UI. */
export function Es({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span lang="es-AR" dir="ltr" className={`es ${className}`}>
      {children}
    </span>
  )
}
