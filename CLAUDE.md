# GARAME — Instructions Claude Code

## Projet
Jeu de cartes traditionnel africain, 2 joueurs, React/Vite (frontend) + Node/Express/Socket.io (backend).

## Structure
```
garame/
├── frontend/
│   ├── gameLogic.js       ← logique pure du jeu (deck, règles, IA)
│   ├── GameBoard.jsx      ← état du jeu, tours, conditions de victoire
│   ├── Home.jsx           ← écran d'accueil + panneau des règles affiché au joueur
│   ├── PokerTable.jsx     ← rendu de la table (pot, cartes jouées)
│   ├── Hand.jsx           ← main du joueur local (éventail)
│   ├── Card.jsx           ← carte face visible
│   ├── CardBack.jsx       ← dos de carte
│   ├── PlayerWaitScreen.jsx ← écran de passage en mode local
│   ├── OnlineLobby.jsx    ← lobby en ligne (créer/rejoindre salle)
│   └── App.jsx            ← routeur principal (home | onlineLobby | game)
├── backend/
│   └── server.js          ← relais Socket.io (createRoom, joinRoom, startRound, playCard)
└── REGLES.md              ← source de vérité des règles du jeu
```

## RÈGLE IMPORTANTE — Mise à jour des règles
**À chaque modification des règles du jeu** (dans `gameLogic.js` ou `GameBoard.jsx`) :
1. Mettre à jour `REGLES.md` (source de vérité documentaire)
2. Mettre à jour le panneau "RÈGLES" dans `Home.jsx` (affiché aux joueurs)

## Modes de jeu
- `"ia"` — Joueur vs IA (bot)
- `"multiplayer"` — 2 joueurs sur le même écran (hot-seat)
- `"online"` — 2 joueurs en réseau via Socket.io

## Deck
4 couleurs (♠ ♥ ♦ ♣) × 7 valeurs (3–9) = 28 cartes. Chaque joueur reçoit 5 cartes.

## Conditions de victoire spéciales (GameBoard.jsx → `checkSpecialWin`)
Vérifiées à la distribution, avant le début du jeu :
1. **Triple 7** : ≥ 3 cartes "7" dans la main → victoire immédiate, priorité absolue
2. **Main ≤ 21** : somme des valeurs ≤ 21 → victoire immédiate (le `roundStarter` gagne en cas d'égalité)

## Bonus dernier 3 (GameBoard.jsx → `endRound`)
Si la carte gagnante du dernier pli d'une manche est un "3" → le vainqueur remporte aussi automatiquement la manche suivante (pot × 2 cumulé, compteur de manches +2).
