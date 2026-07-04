# Sons du jeu (fichiers audio)

Dépose ici tes fichiers **.mp3** (libres de droits). Ils sont servis à la racine
du site (ex. `/sounds/card.mp3`).

## Noms de fichiers attendus

| Fichier                | Usage                                             | Requis |
|------------------------|---------------------------------------------------|--------|
| `card.mp3`             | Son quand une carte est jouée                     | option |
| `bonus.mp3`            | Son de bonus / manche gagnée                      | option |
| `music.mp3`            | Musique de fond (jouée en boucle, faible volume)  | option |
| `koras.mp3`            | Voix « KORAS »                                     | option |
| `export.mp3`           | Voix « 33 Export »                                 | option |

## Fonctionnement

- Dès qu'un fichier est présent avec le bon nom, il **remplace** le son synthétisé
  correspondant (Web Audio / synthèse vocale).
- Si un fichier est absent, le son synthétisé actuel reste utilisé (aucune régression).
- Les boutons « Musique » / « Effets » de l'app contrôlent aussi ces fichiers.

> Astuce : garde des fichiers courts et légers (quelques Ko à ~1–2 Mo) ;
> pour `music.mp3`, une boucle propre (sans blanc au début/fin) sonne mieux.
