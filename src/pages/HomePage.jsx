import TitleScreen from '../components/TitleScreen/TitleScreen'

export default function HomePage({ startGame }) {
  return (
    <div className="home-page">
      <TitleScreen />
      <button onClick={startGame}>Começar Aventura</button>
    </div>
  )
}