import { ScreenTitle } from './ScreenTitle'

interface HistoryScreenProps {
  focusOnMount: boolean
}

export function HistoryScreen({ focusOnMount }: HistoryScreenProps) {
  return <ScreenTitle focusOnMount={focusOnMount}>Tu historial</ScreenTitle>
}
