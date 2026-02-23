import LetterGrid from './Components/LetterGrid'
import { Analytics } from "@vercel/analytics/next"

function App() {
  return (
    <div style={{
      width: "100vw"
    }}>
      <LetterGrid />
      <Analytics />
    </div>
      
  )
}

export default App
