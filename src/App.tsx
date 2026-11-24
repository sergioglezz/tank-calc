import type { KeyValueStore } from './lib/storage'

export interface AppProps {
  /** Where data is remembered; null when the browser does not allow it (D4). */
  storage: KeyValueStore | null
}

function App(_props: AppProps) {
  return <h1>tank-calc</h1>
}

export default App
