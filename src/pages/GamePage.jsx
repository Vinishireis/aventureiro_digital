import { useGameLogic } from '../hooks/useGameLogic';
import GameScreen from '../components/GameScreen/GameScreen';
import ScoreDisplay from '../components/ScoreDisplay/ScoreDisplay';
import Inventory from '../components/Inventory/Inventory';
import SaveManager from '../components/SaveManager/SaveManager';
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
    resetGame,
    saves,
    saveGame,
    loadGame,
    deleteSave,
    showSaveMenu,
    setShowSaveMenu,
    saveName, 
    setSaveName
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
          <button 
            className="action-button save-button" 
            onClick={() => setShowSaveMenu(true)}
          >
            Gerenciar Saves
          </button>
          <button className="action-button reset-button" onClick={resetGame}>
            Novo Jogo
          </button>
        </div>
      </footer>

      <SaveManager
        saves={saves}
        saveGame={saveGame}
        loadGame={loadGame}
        deleteSave={deleteSave}
        showSaveMenu={showSaveMenu}
        setShowSaveMenu={setShowSaveMenu}
        saveName={saveName}
        setSaveName={setSaveName}
      />
    </div>
  );
}