# 🎮 Setup - GARAME

## Étape 1: Installer les dépendances

Ouvrez PowerShell ou Git Bash dans le dossier `garame`:

```bash
npm install
```

Cela va télécharger React, React-DOM, Vite et les plugins nécessaires (~500MB).

## Étape 2: Lancer le serveur de développement

```bash
npm run dev
```

Vous devriez voir:
```
  ➜  Local:   http://localhost:5173/
```

Le navigateur s'ouvrira automatiquement. Sinon, allez manuellement à `http://localhost:5173`

## Étape 3: Jouer!

1. **Votre main** s'affiche en bas
2. Le **plateau vert** au centre montre les cartes jouées
3. L'**IA** joue automatiquement après vous
4. **Cliquez sur une carte** pour la jouer
5. Les cartes **grisées** ne peuvent pas être jouées

## Étapes de chaque pli:

1. ✅ Le joueur qui commence joue sa carte
2. ✅ L'autre joueur DOIT suivre la couleur (s'il la possède)
3. ✅ La carte la plus forte gagne
4. ✅ Recommence jusqu'à 5 cartes jouées = pli terminé
5. ✅ Le gagnant du dernier pli gagne le pot!

## Si ça ne marche pas:

**Erreur: "npm: command not found"**
- Installez Node.js depuis https://nodejs.org (LTS)
- Redémarrez votre terminal

**Erreur: "EACCES: permission denied"**
- Windows: Lancez PowerShell en administrateur
- Linux/Mac: Essayez `sudo npm install`

**Port 5173 déjà utilisé:**
- Modifiez `vite.config.js` et changez `port: 5173` en `port: 5174`

## Pour la production:

```bash
npm run build
```

Cela crée un dossier `dist` avec votre jeu optimisé pour le web.

---

Questions? Consultez le README.md pour les règles du jeu.
