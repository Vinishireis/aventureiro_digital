import './GameScreen.css'

export default function GameScreen({ scene, choices, onChoice }) {
  return (
    <div className="game-screen">
      <div className="narrative-text">{scene}</div>
      <div className="choices-container">
        {choices.map((choice, index) => (
          <button 
            key={index} 
            onClick={() => onChoice(index)}
            className="choice-button"
          >
            {choice.text}
          </button>
        ))}
      </div>
    </div>
  )
}