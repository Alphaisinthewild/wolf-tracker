import { Suspense } from 'react'

export default function LazyRoute({ component: Component }) {
  return (
    <Suspense fallback={<div className="loading-screen">Loading view...</div>}>
      <Component />
    </Suspense>
  )
}
