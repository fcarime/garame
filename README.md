# 🎴 GARAME - Jeu de Cartes

Un jeu de cartes traditionnel africain implémenté en React. Jouez contre une IA intelligente!

## 📋 Règles

- **Objectif**: Remporter le dernier pli pour gagner toute la mise
- **Nombre de joueurs**: 2 (vous vs IA dans cette version)
- **Cartes**: 3 à 9 (28 cartes au total)
- **Distribution**: Chaque joueur reçoit 5 cartes
- **Valeur des cartes**: 3 < 4 < 5 < 6 < 7 < 8 < 9

### Déroulement

1. Chaque joueur met une mise identique (1000 FCFA)
2. Le joueur qui commence joue sa première carte
3. L'autre joueur DOIT suivre la couleur s'il la possède
4. La carte la plus forte gagne le pli
5. Le gagnant du pli joue sa première carte au pli suivant
6. Celui qui gagne le dernier pli remporte le pot!

## 🚀 Installation et Lancement

### Prérequis
- Node.js 16+ et npm

### Étapes

1. Installez les dépendances:
```bash
npm install
```

2. Lancez le serveur de développement:
```bash
npm run dev
```

3. Ouvrez votre navigateur à `http://localhost:5173`

## 🎮 Comment Jouer

1. Attendez votre tour (la couleur demandée s'affiche)
2. Cliquez sur une carte pour la jouer
3. Les cartes grisées ne peuvent pas être jouées
4. L'IA joue automatiquement après vous
5. Le gagnant de chaque pli recommence
6. La partie s'arrête quand quelqu'un atteint 5000 FCFA

## 📁 Structure du Projet

```
garame/
├── frontend/
│   ├── App.jsx           # Composant principal
│   ├── GameBoard.jsx     # Logique du jeu
│   ├── Card.jsx          # Composant carte
│   ├── Hand.jsx          # Main du joueur
│   ├── Table.jsx         # Plateau central
│   ├── GameInfo.jsx      # Scores et pot
│   ├── gameLogic.js      # Règles et IA
│   ├── main.jsx          # Point d'entrée React
│   └── App.css           # Styles
├── index.html            # Page HTML
├── vite.config.js        # Configuration Vite
└── package.json          # Dépendances

```

## 🤖 IA

L'IA joue intelligemment:
- Elle essaie de gagner le pli si possible
- Elle gère les cartes stratégiquement
- Elle suit les règles du jeu correctement

## 🛠 Build pour Production

```bash
npm run build
```

## 📝 Licence

Libre d'usage - Jeu traditionnel africain GARAME

Bon jeu! 🎉
