// Logique du jeu GARAME

export const SUITS = ["♠", "♥", "♦", "♣"];
export const VALUES = ["3", "4", "5", "6", "7", "8", "9"];

const CARD_VALUES = {
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9
};

export function createDeck() {
  const deck = [];
  for (let suit of SUITS) {
    for (let value of VALUES) {
      deck.push({ value, suit });
    }
  }
  return shuffleDeck(deck);
}

export function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(deck, numPlayers = 2, cardsPerPlayer = 5) {
  const hands = Array(numPlayers).fill(null).map(() => []);
  const remaining = [...deck];

  for (let i = 0; i < cardsPerPlayer; i++) {
    for (let player = 0; player < numPlayers; player++) {
      if (remaining.length > 0) {
        hands[player].push(remaining.pop());
      }
    }
  }

  return { hands, deck: remaining };
}

export function canPlayCard(card, leadSuit, hand) {
  // Si la couleur demandée a été jouée, on doit la suivre
  if (leadSuit) {
    const hasSuit = hand.some(c => c.suit === leadSuit);
    return hasSuit ? card.suit === leadSuit : true;
  }
  return true;
}

export function compareCards(card1, card2) {
  return CARD_VALUES[card1.value] - CARD_VALUES[card2.value];
}

export function getWinner(playedCards, leadSuit) {
  // Trouver la carte gagnante (plus forte de la couleur demandée)
  const validCards = playedCards.filter(pc => pc.card.suit === leadSuit);
  if (validCards.length === 0) return null;

  return validCards.reduce((winner, current) => {
    return compareCards(current.card, winner.card) > 0 ? current : winner;
  });
}

export function getAIMove(hand, leadSuit, trick) {
  // L'IA joue intelligemment
  const validCards = hand.filter(card => canPlayCard(card, leadSuit, hand));

  if (validCards.length === 0) return null;

  if (leadSuit) {
    // Si c'est au tour de l'IA et qu'elle doit suivre la couleur
    if (trick.length === 0) {
      // L'IA commence: joue la plus petite carte
      return validCards.reduce((min, card) =>
        compareCards(card, min) < 0 ? card : min
      );
    }
    // Si quelqu'un a déjà joué, essaie de gagner ou joue petit
    const currentWinner = getWinner([...trick, { card: validCards[0] }], leadSuit);
    const canWin = validCards.some(card => {
      const testWinner = getWinner([...trick, { card }], leadSuit);
      return testWinner.card === card;
    });

    if (canWin) {
      // Joue la plus petite carte gagnante
      const winningCards = validCards.filter(card => {
        const testWinner = getWinner([...trick, { card }], leadSuit);
        return testWinner.card === card;
      });
      return winningCards.reduce((min, card) =>
        compareCards(card, min) < 0 ? card : min
      );
    }
  }

  // Par défaut, joue la plus petite carte
  return validCards.reduce((min, card) =>
    compareCards(card, min) < 0 ? card : min
  );
}

export function isHandEmpty(hand) {
  return hand.length === 0;
}

export function sortHand(hand) {
  return [...hand].sort((a, b) => {
    const suitOrder = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 };
    const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
    if (suitDiff !== 0) return suitDiff;
    return CARD_VALUES[a.value] - CARD_VALUES[b.value];
  });
}

export function getHandSum(hand) {
  return hand.reduce((sum, card) => sum + CARD_VALUES[card.value], 0);
}

// Returns { player, reason, sum? } or null. Triple-7 has priority over under-21.
// A hand whose values sum to 21 or less wins. If both qualify, roundStarter wins.
export function checkSpecialWin(hands, roundStarter) {
  for (let i = 0; i < hands.length; i++) {
    if (hands[i].filter(c => c.value === "7").length >= 3) {
      return { player: i, reason: "triple7" };
    }
  }
  for (const i of [roundStarter, 1 - roundStarter]) {
    const sum = getHandSum(hands[i]);
    if (sum <= 21) return { player: i, reason: "under21", sum };
  }
  return null;
}
