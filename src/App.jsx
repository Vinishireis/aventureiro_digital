import { useState } from 'react'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import './index.css'

function App() {
  const [gameStarted, setGameStarted] = useState(false)

  return (
    <div className="app">
      {!gameStarted ? (
        <HomePage startGame={() => setGameStarted(true)} />
      ) : (
        <GamePage backToHome={() => setGameStarted(false)} />
      )}
    </div>
  )
}

export default App