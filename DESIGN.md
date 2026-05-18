# 🎰 Design GARAME - Style Casino Professional

## 🎴 Cartes
- ✅ Design réaliste de vraies cartes
- ✅ Valeur affichée en haut à gauche et bas à droite (retournée)
- ✅ Symboles de couleur (♠ ♥ ♦ ♣) traditionnels
- ✅ Dégradé blanc/gris pour effet 3D
- ✅ Ombre portée pour profondeur
- ✅ Effet hover: lève la carte avec zoom
- ✅ Cartes invalidées grisées

### Dimensions
- Largeur: 70px
- Hauteur: 100px
- Coins arrondis: 8px
- Shadow: 0 4px 12px pour effet réaliste

---

## 🎲 Plateau (Table)
- ✅ Tapis vert foncé style casino (radial gradient)
- ✅ Texture verte avec lignes subtiles
- ✅ Bordure sombre (noir/vert très foncé)
- ✅ Affichage élégant des cartes jouées
- ✅ Espacement proportionnel entre les cartes
- ✅ Animation d'apparition des cartes

### Couleur du Tapis
```
Gradient radial:
- Centre: #1a5c3a (vert clair)
- Milieu: #0d3d1f (vert moyen)
- Bords: #051a0d (vert très foncé)
```

---

## 👤 Joueurs (GameInfo)
- ✅ Cartes affichées en haut avec avatar et score
- ✅ Avatar: 👤 pour vous, 🤖 pour IA
- ✅ Score affiché sur fond coloré
- ✅ Vous: couleur verte (#52b788)
- ✅ IA: couleur orange (#f77f00)
- ✅ Bordure de couleur pour distinction

### Layout
- Affichage horizontal en haut
- Cartes de joueur blanches/claires
- Bordure épaisse (2px) avec couleur du joueur
- Ombre légère pour relief

---

## 💰 Informations Partie
- ✅ Pot: dégradé doré (gold)
- ✅ Manche: dégradé rouge/orange
- ✅ Affichage côte à côte
- ✅ Nombres gros et lisibles
- ✅ Unité FCFA claire

---

## 🎯 Messages
- ✅ Fond semi-transparent blanc
- ✅ Texte blanc uppercase avec lettrespacing
- ✅ Changements de couleur selon contexte:
  - Attente: vert (#52b788)
  - En cours: gris blanc (#fff)
  - Fin de partie: doré (#ffd60a)

---

## 🏆 Écran de Fin
- ✅ Modal avec fond flou (blur)
- ✅ Dégradé vert foncé (style table)
- ✅ Bordure dorée (#ffd60a)
- ✅ Texte doré et blanc
- ✅ Résultat en couleur (vert si gagné, rouge si perdu)
- ✅ Bouton doré avec shadow effect
- ✅ Animation slide-up

### Décoration
- Cercle semi-transparent en haut-droit (ornemental)
- Texte avec text-shadow pour profondeur
- Animations fluides

---

## 🎨 Palette de Couleurs Globale

### Primaire
- Vert foncé: #1b4332
- Vert clair: #2d6a4f
- Vert très foncé: #0f2818

### Accents
- Doré: #ffd60a
- Orange: #f77f00
- Rouge: #d62828
- Vert succès: #52b788

### Fond
- Table: dégradé radial vert
- Modals: blanc/gris
- Buttons: doré/vert

---

## 🎬 Animations
- ✅ Hover sur cartes: translateY(-10px) scale(1.08)
- ✅ Cartes jouées: slideIn 0.4s
- ✅ Messages: fadeIn 0.3s
- ✅ Modal fin: slideUp 0.4s
- ✅ Pulse sur attente: 2s loop

---

## 📱 Responsive
- ✅ Tout rentre sur l'écran (pas de scroll)
- ✅ Layout flexbox adaptatif
- ✅ Cartes responsive
- ✅ Textes redimensionnés pour lisibilité

---

## ✨ Effets Visuels
- Ombres douces et naturelles
- Gradients pour profondeur
- Textures subtiles sur le tapis
- Animations fluides et rapides
- Feedback visuel sur les interactions
