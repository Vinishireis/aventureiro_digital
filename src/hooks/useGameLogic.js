import { useState, useEffect, useCallback } from 'react';
import { gameStates } from '../constants/gameStates';

const API_URL = 'https://aventura-api-three.vercel.app/api/story';

// Sistema de pontuação configurável
const SCORE_CONFIG = {
  BASE_CHOICE: 10,          // Pontos base por escolha
  SPECIAL_CHOICE: 50,       // Pontos por escolhas especiais
  LIFE_BONUS: 100,          // Bônus por vida restante
  GAME_COMPLETE: 500,       // Bônus por completar o jogo
  ITEM_MULTIPLIER: 1.1,     // Multiplicador por item no inventário
  UNIQUE_SCENE_BONUS: 30,   // Bônus por cena única completada
  DEATH_PENALTY: -50,       // Penalidade por morte
  ITEM_USE_BONUS: 20        // Bônus por uso estratégico de item
};

// Estado inicial do jogo
const INITIAL_GAME_STATE = {
  currentScene: 'start',
  score: 0,
  lives: 3,
  inventory: [
    { 
      id: 1, 
      name: 'Poção de Vida', 
      icon: '❤️', 
      description: 'Recupera 1 vida', 
      quantity: 1, 
      effect: 'heal' 
    },
    { 
      id: 2, 
      name: 'Mapa Antigo', 
      icon: '🗺️', 
      description: 'Fornece dicas secretas', 
      quantity: 1 
    }
  ],
  completedScenes: [],
  deaths: 0
};

export function useGameLogic() {
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saves, setSaves] = useState([]);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  // Carrega todos os saves do Local Storage
  const loadAllSaves = useCallback(() => {
    try {
      const savesData = localStorage.getItem('aventureiroDigitalSaves');
      return savesData ? JSON.parse(savesData) : [];
    } catch (error) {
      console.error('Erro ao carregar saves:', error);
      return [];
    }
  }, []);

  // Carrega dados iniciais
  useEffect(() => {
    const loadGameData = async () => {
      try {
        const response = await fetch(API_URL);
        const apiData = await response.json();
        setStoryData(apiData);
        
        // Carrega lista de saves
        setSaves(loadAllSaves());
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, [loadAllSaves]);

  // Salva o jogo com um nome específico
  const saveGame = useCallback((name) => {
    try {
      const allSaves = loadAllSaves();
      const newSave = {
        id: Date.now(),
        name: name || `Save ${new Date().toLocaleString()}`,
        data: gameState,
        timestamp: new Date().toISOString()
      };

      // Atualiza se já existir com o mesmo nome, ou adiciona novo
      const existingIndex = allSaves.findIndex(s => s.name === newSave.name);
      if (existingIndex >= 0) {
        allSaves[existingIndex] = newSave;
      } else {
        allSaves.push(newSave);
      }

      localStorage.setItem('aventureiroDigitalSaves', JSON.stringify(allSaves));
      setSaves(allSaves);
      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 2000);
      return true;
    } catch (error) {
      console.error('Erro ao salvar:', error);
      return false;
    }
  }, [gameState, loadAllSaves]);

  // Carrega um save específico
  const loadGame = useCallback((saveId) => {
    const allSaves = loadAllSaves();
    const saveToLoad = allSaves.find(save => save.id === saveId);
    
    if (saveToLoad) {
      setGameState({
        ...INITIAL_GAME_STATE,
        ...saveToLoad.data
      });
      setShowSaveMenu(false);
      return true;
    }
    return false;
  }, [loadAllSaves]);

  // Deleta um save
  const deleteSave = useCallback((saveId) => {
    try {
      const allSaves = loadAllSaves();
      const updatedSaves = allSaves.filter(save => save.id !== saveId);
      
      localStorage.setItem('aventureiroDigitalSaves', JSON.stringify(updatedSaves));
      setSaves(updatedSaves);
      return true;
    } catch (error) {
      console.error('Erro ao deletar save:', error);
      return false;
    }
  }, [loadAllSaves]);

  const currentSceneData = storyData 
    ? storyData.scenes[gameState.currentScene] || storyData.scenes.start 
    : gameStates[gameState.currentScene] || gameStates.start;

  const calculateScore = useCallback((basePoints, isNewScene = false) => {
    if (isNewScene && gameState.completedScenes.includes(gameState.currentScene)) {
      return 0;
    }

    const inventoryMultiplier = Math.min(
      2.0,
      gameState.inventory.length > 0 
        ? SCORE_CONFIG.ITEM_MULTIPLIER * gameState.inventory.length 
        : 1
    );

    const uniqueSceneBonus = isNewScene && !gameState.completedScenes.includes(gameState.currentScene)
      ? SCORE_CONFIG.UNIQUE_SCENE_BONUS
      : 0;

    return Math.floor(basePoints * inventoryMultiplier) + uniqueSceneBonus;
  }, [gameState.completedScenes, gameState.currentScene, gameState.inventory.length]);

  const makeChoice = (choiceIndex) => {
    if (loading || !currentSceneData.choices?.[choiceIndex]) return;

    const choice = currentSceneData.choices[choiceIndex];
    
    setGameState(prev => {
      const livesChange = choice.livesChange || 0;
      const newLives = Math.max(0, prev.lives + livesChange);
      
      const baseScore = choice.scoreChange || SCORE_CONFIG.BASE_CHOICE;
      const scoreEarned = calculateScore(baseScore, true);
      const deathPenalty = livesChange < 0 ? SCORE_CONFIG.DEATH_PENALTY : 0;
      const newScore = Math.max(0, prev.score + scoreEarned + deathPenalty);

      if (newLives <= 0) {
        const finalScore = newScore + (prev.lives * SCORE_CONFIG.LIFE_BONUS);
        return {
          currentScene: 'gameOver',
          score: finalScore,
          lives: 0,
          inventory: [],
          completedScenes: [],
          deaths: prev.deaths + 1
        };
      }

      const updatedCompletedScenes = [...prev.completedScenes];
      if (!updatedCompletedScenes.includes(prev.currentScene)) {
        updatedCompletedScenes.push(prev.currentScene);
      }

      return {
        ...prev,
        currentScene: choice.nextScene || 'start',
        score: newScore,
        lives: newLives,
        completedScenes: updatedCompletedScenes,
        deaths: livesChange < 0 ? prev.deaths + 1 : prev.deaths
      };
    });
  };

  const useItem = (item) => {
    setGameState(prev => {
      const newInventory = [...prev.inventory];
      const itemIndex = newInventory.findIndex(i => i.id === item.id);
      
      if (itemIndex === -1) return prev;

      const updatedItem = { ...newInventory[itemIndex] };
      updatedItem.quantity -= 1;

      if (updatedItem.quantity <= 0) {
        newInventory.splice(itemIndex, 1);
      } else {
        newInventory[itemIndex] = updatedItem;
      }

      const useBonus = calculateScore(SCORE_CONFIG.ITEM_USE_BONUS);
      
      let newState = { 
        ...prev, 
        inventory: newInventory,
        score: prev.score + useBonus
      };

      if (item.effect === 'heal') {
        newState.lives = Math.min(3, prev.lives + 1);
      }

      return newState;
    });
  };

  const resetGame = useCallback(() => {
    setGameState(INITIAL_GAME_STATE);
  }, []);

  if (loading) {
    return {
      currentScene: "Carregando aventura...",
      choices: [],
      score: 0,
      lives: 3,
      loading: true,
      makeChoice: () => {},
      resetGame,
      useItem,
      saves: [],
      saveGame: () => {},
      loadGame: () => {},
      deleteSave: () => {},
      showSaveMenu: false,
      setShowSaveMenu: () => {},
      saveName: '',
      setSaveName: () => {},
      showSavedMessage: false
    };
  }

  if (gameState.lives <= 0) {
    return {
      currentScene: `Você perdeu todas as suas vidas! Pontuação final: ${gameState.score}`,
      choices: [{
        text: "Tentar novamente",
        nextScene: "start"
      }],
      score: gameState.score,
      lives: 0,
      loading: false,
      makeChoice: resetGame,
      resetGame,
      useItem,
      saves,
      saveGame,
      loadGame,
      deleteSave,
      showSaveMenu,
      setShowSaveMenu,
      saveName,
      setSaveName,
      showSavedMessage
    };
  }

  return {
    currentScene: currentSceneData.text,
    choices: currentSceneData.choices || [],
    score: gameState.score,
    lives: gameState.lives,
    inventory: gameState.inventory,
    loading: false,
    makeChoice,
    resetGame,
    useItem,
    deaths: gameState.deaths,
    saves,
    saveGame,
    loadGame,
    deleteSave,
    showSaveMenu,
    setShowSaveMenu,
    saveName,
    setSaveName,
    showSavedMessage
  };
}