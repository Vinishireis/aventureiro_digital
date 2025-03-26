import './ScoreDisplay.css'

export default function ScoreDisplay({ score, lives }) {
  return (
    <div className="score-display">
      <div className="score">Pontuação: <span>{score}</span></div>
      <div className="lives">Vidas: <span>{'❤️'.repeat(lives)}</span></div>
    </div>
  )
}