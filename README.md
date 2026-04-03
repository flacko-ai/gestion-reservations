# 🏠 Gestion Réservations — Guide de déploiement Vercel

## Prérequis
- Un compte GitHub (gratuit) → https://github.com
- Un compte Vercel (gratuit) → https://vercel.com

---

## Étape 1 — Mettre le code sur GitHub

1. Va sur https://github.com/new
2. Nom du repo : `gestion-reservations`
3. Laisse en **Public** ou **Private** (comme tu veux)
4. Clique **Create repository**
5. Sur la page du repo vide, clique **"uploading an existing file"**
6. Glisse-dépose **tous les fichiers et dossiers** du zip (sauf `node_modules/`) :
   - `package.json`
   - `vite.config.js`
   - `index.html`
   - `public/` (dossier entier)
   - `src/` (dossier entier)
7. Clique **Commit changes**

---

## Étape 2 — Déployer sur Vercel

1. Va sur https://vercel.com et connecte-toi avec ton compte GitHub
2. Clique **"Add New..." → Project**
3. Tu verras ton repo `gestion-reservations` — clique **Import**
4. Vercel détecte automatiquement que c'est un projet Vite
5. Clique **Deploy**
6. Attends ~30 secondes... C'est en ligne ! 🎉
7. Tu reçois une URL du type : `gestion-reservations-xxx.vercel.app`

---

## Étape 3 — Installer sur le téléphone de ta mère

### Sur iPhone (Safari) :
1. Ouvre l'URL Vercel dans Safari
2. Appuie sur l'icône **Partager** (carré avec flèche)
3. Choisis **"Sur l'écran d'accueil"**
4. L'app apparaît comme une icône sur l'écran d'accueil

### Sur Android (Chrome) :
1. Ouvre l'URL dans Chrome
2. Appuie sur les **3 points** en haut à droite
3. Choisis **"Ajouter à l'écran d'accueil"**
4. L'app s'ouvre en plein écran comme une vraie app

---

## Étape 4 (optionnel) — Domaine personnalisé

Dans Vercel → Settings → Domains, tu peux ajouter un domaine custom.
Exemple : `reservations.nom-de-famille.com`

---

## Notes importantes

- **Les données sont stockées localement** sur le téléphone (localStorage).
  Ça veut dire que chaque appareil a ses propres données.
- Si ta mère utilise un seul téléphone pour gérer, c'est parfait.
- Si elle veut synchroniser entre plusieurs appareils, il faudra ajouter
  un backend (Firebase, Supabase, etc.) — dis-moi si tu veux ça.
- Pour personnaliser les appartements par défaut, modifie `DEFAULT_APTS`
  dans `src/App.jsx`.
