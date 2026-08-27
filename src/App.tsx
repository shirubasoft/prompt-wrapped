import { useState } from 'react'

import { Home } from './components/Home'
import { Story } from './components/Story'
import { readWrappedHash } from './lib/codec'
import type { WrappedData } from './lib/schema'
import './App.css'

function initialData(): { data: WrappedData | null; error: string | null } {
  try {
    return { data: readWrappedHash(), error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'This Prompt Wrapped link is invalid.',
    }
  }
}

export default function App() {
  const initial = initialData()
  const [data, setData] = useState<WrappedData | null>(initial.data)
  const [error, setError] = useState<string | null>(initial.error)

  if (data) {
    return <Story initialData={data} onClose={() => setData(null)} />
  }

  return (
    <>
      {error && (
        <div className="link-error" role="alert">
          <strong>That recap did not survive the trip.</strong>
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      <Home onOpen={setData} />
    </>
  )
}
