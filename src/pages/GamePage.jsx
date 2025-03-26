import { useGameLogic } from '../hooks/useGameLogic';
import GameScreen from '../components/GameScreen/GameScreen';
import ScoreDisplay from '../components/ScoreDisplay/ScoreDisplay';
import Inventory from '../components/Inventory/Inventory';
import './GamePage.css';

export default function GamePage({ backToHome }) {
  const {
    currentScene,
    choices,
    score,
    lives,
    inventory,
    makeChoice,
    useItem,
    saveGame,
    resetGame,
    showSavedMessage
  } = useGameLogic();

  return (
    <div className="game-page">
      <header className="game-header">
        <button className="back-button" onClick={backToHome}>
          ← Menu Principal
        </button>
        <ScoreDisplay score={score} lives={lives} />
      </header>

      <main className="game-content">
        <section className="inventory-section">
          <Inventory items={inventory} onUseItem={useItem} />
        </section>

        <section className="adventure-section">
          <GameScreen 
            scene={currentScene} 
            choices={choices} 
            onChoice={makeChoice} 
          />
        </section>
      </main>

      <footer className="game-footer">
        <div className="game-actions">
          <button className="action-button save-button" onClick={saveGame}>
            Salvar Jogo
          </button>
          <button className="action-button reset-button" onClick={resetGame}>
            Novo Jogo
          </button>
        </div>
        {showSavedMessage && (
          <div className="save-message">Progresso salvo!</div>
        )}
      </footer>
    </div>
  );
}