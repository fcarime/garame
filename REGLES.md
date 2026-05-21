# GARAME — Règles du jeu

> Ce fichier est la source de vérité des règles. Il doit être mis à jour à chaque modification de `gameLogic.js` ou `GameBoard.jsx`, et les changements doivent aussi être répercutés dans le panneau "RÈGLES" de `Home.jsx`.

---

## Deck

- **Cartes** : 28 cartes — 4 couleurs (♠ ♥ ♦ ♣) × 7 valeurs (3, 4, 5, 6, 7, 8, 9)
- **Distribution** : 5 cartes par joueur au début de chaque manche

---

## Déroulement d'une manche

1. Les cartes sont distribuées. Les conditions spéciales sont vérifiées immédiatement (voir ci-dessous).
2. Si aucune condition spéciale, le jeu commence. Les joueurs s'affrontent en plis.
3. Le premier joueur joue une carte — sa couleur devient la **couleur demandée**.
4. Le second joueur **doit suivre la couleur** s'il en possède une ; sinon il joue librement.
5. La carte la plus haute de la couleur demandée gagne le pli.
6. Le gagnant du pli joue en premier au pli suivant.
7. La manche se termine quand les 5 plis sont joués : le gagnant du dernier pli remporte la manche.

---

## Valeurs des cartes

| Carte | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|-------|---|---|---|---|---|---|---|
| Valeur | 3 | 4 | 5 | 6 | 7 | 8 | 9 |

Ordre croissant : **3 < 4 < 5 < 6 < 7 < 8 < 9**

---

## Mise

- La partie est une **mise unique** : chaque joueur engage **1 000 FCFA**, soit un pot total de **2 000 FCFA**.
- Le gagnant de la partie remporte les **2 000 FCFA**.
- La mise ne change pas entre les manches — c'est le résultat final de la partie qui détermine qui encaisse.

---

## Condition de fin de partie

- Le premier joueur à remporter **3 manches** gagne la partie et encaisse les **2 000 FCFA**.
- Le bonus "Dernier 3" peut faire sauter 2 manches d'un coup (voir ci-dessous).

---

## Conditions de victoire spéciale (vérifiées à la distribution)

### 1. Triple Sept ⚡ *(priorité absolue)*
> Si un joueur a **au moins 3 cartes "7"** dans sa main, il gagne la manche immédiatement.

- Sa main est **révélée face visible** pour montrer les trois 7 à l'adversaire.
- Les cartes 7 sont mises en évidence (surélevées, bordure dorée).
- Priorité sur toutes les autres règles.

### 2. Main Basse 🃏 *(second en priorité)*
> Si la **somme des valeurs** des cartes d'un joueur est **strictement inférieure à 21**, il gagne la manche immédiatement.

- Sa main est **révélée face visible** avec le total affiché.
- Si les deux joueurs remplissent cette condition simultanément, c'est le **joueur qui commence** (roundStarter) qui gagne.
- Exemples de mains qualifiantes : 3+3+3+3+4 = 16, 3+3+3+4+5 = 18, 3+3+4+4+5 = 19…

---

## Bonus : Dernier 3 🎯
> Si un joueur gagne une manche **et que la carte gagnante du dernier pli est un "3"**, il remporte automatiquement la manche suivante sans jouer.

- Le joueur reçoit **+2 manches** au compteur au lieu de +1.
- Le compteur de manches avance de 2.
- Le joueur qui commence la manche d'après reste le même (alternance double = inchangé).
- Si ce double gain atteint ou dépasse 3 manches, la partie se termine immédiatement.

---

## Bonus : 33 Export 🔴 *(priorité sur Dernier 3)*
> Si un joueur termine la manche en jouant **deux 3 consécutifs** sur les deux derniers plis (sa 4ème carte est un 3 **et** sa 5ème et dernière carte est aussi un 3), il remporte instantanément **les 3 manches** de la partie.

- Condition : le même joueur joue un 3 sur l'avant-dernier pli **et** un 3 sur le dernier pli, **et** gagne ce dernier pli.
- Résultat : victoire totale immédiate — son score passe directement à 3 manches.
- Priorité sur le Dernier 3 (les deux 3 consécutifs l'emportent).
- Un effet visuel spécial "33 EXPORT" s'affiche avant l'écran de fin de partie.
