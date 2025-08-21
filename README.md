# 🎲 Catan Dice Game Online

A real-time multiplayer web application that brings the Catan Dice Game to life.  
It provides synchronized dice rolls, animated effects, strict turn order, detailed player statistics, and persistent game history — everything you need to play with friends online.

![Uploading image.png…]()


## ✅ Implemented Features

1. **Real-Time Multiplayer** — 2 to 6 players connected via WebSocket.
2. **Dice Roll Animation** — realistic spinning dice (1 second).
3. **Strict Turn Order** — turns are synchronized across all players.
4. **"Bandits" Screen** — special event when the sum is 7 (western-style image, 3 seconds).
5. **Detailed Statistics** — all rolls are tracked per player, highlighting 7s.
6. **Game History** — full roll history stored on the server and shared with players.
7. **Modern UI** — responsive interface built with `shadcn/ui` and `Tailwind CSS`.

## 🎯 Key Features

* **Online Multiplayer**: real-time synchronization with multiple players.
* **Dice Animation**: immersive, realistic spin effect.
* **Bandits Screen**: atmospheric event on 7.
* **Statistics & History**: detailed tracking for fairness and strategy.
* **Responsive Design**: optimized for desktop, tablet, and mobile.

## 🎨 User Interface

* Adaptive layout with clear turn indicators.
* Smooth animations and transitions.
* Intuitive controls for all players.

## 🔧 Technical Implementation

* **Stack**: `Next.js`, `shadcn/ui`, `Tailwind CSS`, `Socket.IO`.
* **Logic**: custom implementation of fair dice rolls with shoe-based algorithm.
* **Data Storage**: server-side room state + optional persistence.
* **Extensibility**: ready for future board game mechanics.

## 🚀 Installation & Running

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/catan-dice-game.git
cd catan-dice-game
```
## Install dependencies
```bash
yarn install
# or
npm install
 **Run the development server**
yarn dev
# or
npm run dev
```
### real game online 
- https://dice-game-qt97.onrender.com (test server)
