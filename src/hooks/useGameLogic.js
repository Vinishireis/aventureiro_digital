import { useState, useEffect, useCallback } from 'react';
import { gameStates } from '../constants/gameStates';

const API_URL = 'https://aventura-api-three.vercel.app/api/story';

// Sistema de pontuação configurável (agora mais completo)
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
    ],
    completedScenes: [],
    deaths: 0 // Contador de mortes para penalidades
  });

  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega os dados da API e o jogo salvo
  useEffect(() => {
    const loadGameData = async () => {
      try {
        const response = await fetch(API_URL);
        const apiData = await response.json();
        setStoryData(apiData);

        const savedGame = localStorage.getItem('aventureiroDigitalSave');
        if (savedGame) {
          const parsedData = JSON.parse(savedGame);
          setGameState(prev => ({
            ...prev,
            ...parsedData,
            // Garante que arrays não sejam undefined
            inventory: parsedData.inventory || prev.inventory,
            completedScenes: parsedData.completedScenes || prev.completedScenes
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

  // Salva o jogo automaticamente quando o estado muda
  useEffect(() => {
    localStorage.setItem('aventureiroDigitalSave', JSON.stringify(gameState));
  }, [gameState]);

  const currentSceneData = storyData 
    ? storyData.scenes[gameState.currentScene] || storyData.scenes.start 
    : gameStates[gameState.currentScene] || gameStates.start;

  // useCallback para memoizar a função e evitar recriações desnecessárias
  const calculateScore = useCallback((basePoints, isNewScene = false) => {
    // Evitar pontuar duas vezes pela mesma cena
    if (isNewScene && gameState.completedScenes.includes(gameState.currentScene)) {
      return 0;
    }

    // Multiplicador baseado no inventário (agora com limite máximo)
    const inventoryMultiplier = Math.min(
      2.0, // Limite máximo do multiplicador
      gameState.inventory.length > 0 
        ? SCORE_CONFIG.ITEM_MULTIPLIER * gameState.inventory.length 
        : 1
    );

    // Bônus por cena única (se aplicável)
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
      
      // Calcular pontuação base
      const baseScore = choice.scoreChange || SCORE_CONFIG.BASE_CHOICE;
      const scoreEarned = calculateScore(baseScore, true);
      
      // Aplicar penalidade por morte (se houver)
      const deathPenalty = livesChange < 0 ? SCORE_CONFIG.DEATH_PENALTY : 0;
      
      const newScore = Math.max(0, prev.score + scoreEarned + deathPenalty);

      // Verificar se é game over
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

      // Atualizar cenas completadas
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
        // Incrementa mortes apenas se perdeu vida
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

      // Calcular bônus por uso de item
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
      ],
      completedScenes: [],
      deaths: 0
    });
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
      useItem
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
    useItem,
    deaths: gameState.deaths // Exposto para UI
  };
}