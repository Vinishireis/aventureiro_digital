import { useState } from 'react';
import './SaveManager.css';

export default function SaveManager({ 
  saves, 
  saveGame, 
  loadGame, 
  deleteSave,
  showSaveMenu,
  setShowSaveMenu,
  saveName,
  setSaveName
}) {
  const [activeTab, setActiveTab] = useState('load'); // 'load' ou 'save'

  const handleSave = () => {
    if (saveName.trim()) {
      saveGame(saveName);
      setSaveName('');
      setShowSaveMenu(false);
    }
  };

  return (
    <div className={`save-manager ${showSaveMenu ? 'visible' : ''}`}>
      <div className="save-manager-content">
        <button 
          className="close-button"
          onClick={() => setShowSaveMenu(false)}
        >
          ×
        </button>
        
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'load' ? 'active' : ''}`}
            onClick={() => setActiveTab('load')}
          >
            Carregar
          </button>
          <button
            className={`tab ${activeTab === 'save' ? 'active' : ''}`}
            onClick={() => setActiveTab('save')}
          >
            Salvar
          </button>
        </div>

        {activeTab === 'load' ? (
          <div className="load-section">
            {saves.length === 0 ? (
              <p className="no-saves">Nenhum save encontrado</p>
            ) : (
              <ul className="saves-list">
                {saves.map(save => (
                  <li key={save.id} className="save-item">
                    <div className="save-info">
                      <h3>{save.name}</h3>
                      <p>{new Date(save.timestamp).toLocaleString()}</p>
                      <p>Score: {save.data.score} | Vidas: {save.data.lives}</p>
                    </div>
                    <div className="save-actions">
                      <button 
                        className="load-button"
                        onClick={() => loadGame(save.id)}
                      >
                        Carregar
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => deleteSave(save.id)}
                      >
                        Deletar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="save-section">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Nome do save"
              className="save-input"
            />
            <button 
              className="confirm-save-button"
              onClick={handleSave}
              disabled={!saveName.trim()}
            >
              Confirmar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}