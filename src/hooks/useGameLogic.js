import { useState, useEffect } from 'react';
import { gameStates } from '../constants/gameStates';

// ✅ Configuração centralizada da URL
const API_URL = 'https://aventura-api-three.vercel.app/api/story';

export function useGameLogic() {
  const [gameState, setGameState] = useState({
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
    ]
  });

  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega os dados da API e o jogo salvo
  useEffect(() => {
    const loadGameData = async () => {
      try {
        // Carrega dados da API
        const response = await fetch(API_URL);
        const apiData = await response.json();
        setStoryData(apiData);

        // Carrega jogo salvo localmente
        const savedGame = localStorage.getItem('aventureiroDigitalSave');
        if (savedGame) {
          const parsedData = JSON.parse(savedGame);
          setGameState(prev => ({
            ...prev,
            ...parsedData
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, []);

  // Salvar jogo automaticamente quando o estado muda
  useEffect(() => {
    try {
      localStorage.setItem('aventureiroDigitalSave', JSON.stringify(gameState));
    } catch (error) {
      console.error("Erro ao salvar jogo:", error);
    }
  }, [gameState]);

  const currentSceneData = storyData 
    ? storyData.scenes[gameState.currentScene] || storyData.scenes.start 
    : gameStates[gameState.currentScene] || gameStates.start;

  const makeChoice = (choiceIndex) => {
    if (loading) return;

    const choice = currentSceneData.choices?.[choiceIndex];
    if (!choice) return;

    setGameState(prev => {
      const newLives = Math.max(0, prev.lives + (choice.livesChange || 0));
      const newScore = Math.max(0, prev.score + (choice.scoreChange || 0));
      
      if (newLives <= 0) {
        return {
          currentScene: 'gameOver',
          score: newScore,
          lives: 0,
          inventory: []
        };
      }

      return {
        ...prev,
        currentScene: choice.nextScene || 'start',
        score: newScore,
        lives: newLives
      };
    });
  };

  const useItem = (item) => {
    setGameState(prev => {
      const newInventory = [...prev.inventory];
      const itemIndex = newInventory.findIndex(i => i.id === item.id);
      
      if (itemIndex !== -1) {
        if (newInventory[itemIndex].quantity > 1) {
          newInventory[itemIndex].quantity -= 1;
        } else {
          newInventory.splice(itemIndex, 1);
        }
      }

      // Aplicar efeitos do item
      let newState = { ...prev, inventory: newInventory };
      if (item.effect === 'heal') {
        newState.lives = Math.min(3, prev.lives + 1);
      }

      return newState;
    });
  };

  const resetGame = () => {
    setGameState({
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
      ]
    });
  };

  if (loading) {
    return {
      currentScene: "Carregando aventura...",
      choices: [],
      score: 0,
      lives: 3,
      loading: true,
      makeChoice: () => {},
      resetGame,
      useItem
    };
  }

  if (gameState.lives <= 0) {
    return {
      currentScene: "Você perdeu todas as suas vidas! Fim da jornada...",
      choices: [{
        text: "Tentar novamente",
        nextScene: "start"
      }],
      score: gameState.score,
      lives: 0,
      loading: false,
      makeChoice: resetGame,
      resetGame,
      useItem
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
    useItem
  };
}