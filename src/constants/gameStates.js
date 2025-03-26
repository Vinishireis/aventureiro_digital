export const gameStates = {
    start: {
      text: "Você está em uma floresta escura. Há um caminho à direita e um rio à esquerda. O que você faz?",
      choices: [
        {
          text: "Seguir pelo caminho escuro",
          nextScene: "darkPath",
          scoreChange: 0
        },
        {
          text: "Tentar atravessar o rio",
          nextScene: "river",
          livesChange: -1,
          scoreChange: 5
        }
      ]
    },
    darkPath: {
      text: "O caminho escuro leva a uma caverna misteriosa. Dentro, você vê um baú e uma passagem estreita.",
      choices: [
        {
          text: "Abrir o baú",
          nextScene: "chest",
          scoreChange: 10
        },
        {
          text: "Seguir pela passagem",
          nextScene: "narrowPath",
          scoreChange: 5
        }
      ]
    },
    river: {
      text: "Você tenta atravessar o rio, mas a correnteza é forte. Perde uma vida, mas encontra uma moeda antiga na margem.",
      choices: [
        {
          text: "Voltar para a floresta",
          nextScene: "start",
          scoreChange: 5
        },
        {
          text: "Seguir rio abaixo",
          nextScene: "riverDown",
          scoreChange: 0
        }
      ]
    },
    chest: {
      text: "Você abre o baú e encontra um mapa do tesouro! Ganha 10 pontos.",
      choices: [
        {
          text: "Continuar explorando",
          nextScene: "narrowPath",
          scoreChange: 0
        }
      ]
    },
    narrowPath: {
      text: "A passagem estreita leva a uma clareira com um portal mágico. Um guardião bloqueia o caminho.",
      choices: [
        {
          text: "Conversar com o guardião",
          nextScene: "guardian",
          scoreChange: 0
        },
        {
          text: "Tentar contornar o guardião",
          nextScene: "sneakPast",
          livesChange: -1,
          scoreChange: 0
        }
      ]
    },
    guardian: {
      text: "O guardião diz: 'Para passar, responda: O que quanto mais você tira, maior fica?'",
      choices: [
        {
          text: "'Um buraco'",
          nextScene: "correctAnswer",
          scoreChange: 20
        },
        {
          text: "'Uma árvore'",
          nextScene: "wrongAnswer",
          livesChange: -1,
          scoreChange: 0
        }
      ]
    },
    correctAnswer: {
      text: "Resposta correta! O guardião sorri e abre o portal. Você venceu o jogo!",
      choices: [
        {
          text: "Jogar novamente",
          nextScene: "start",
          scoreChange: 0
        }
      ]
    },
    wrongAnswer: {
      text: "Resposta errada! O guardião fica irritado e você perde uma vida.",
      choices: [
        {
          text: "Tentar novamente",
          nextScene: "guardian",
          scoreChange: 0
        },
        {
          text: "Voltar",
          nextScene: "narrowPath",
          scoreChange: 0
        }
      ]
    },
    sneakPast: {
      text: "Você tenta passar pelo guardião, mas ele te pega. Perde uma vida!",
      choices: [
        {
          text: "Voltar",
          nextScene: "narrowPath",
          scoreChange: 0
        }
      ]
    },
    riverDown: {
      text: "Seguindo rio abaixo, você encontra uma vila pacífica. Os moradores te recompensam com informações valiosas.",
      choices: [
        {
          text: "Agradecer e voltar",
          nextScene: "start",
          scoreChange: 15
        }
      ]
    }
  }