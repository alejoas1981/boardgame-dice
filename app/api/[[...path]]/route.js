import { Server } from 'socket.io'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

let io
let mongoClient
let db

// Game state storage
const gameRooms = new Map()

async function initializeDatabase() {
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.MONGO_URL)
    await mongoClient.connect()
    db = mongoClient.db(process.env.DB_NAME || 'dice_game')
  }
  return db
}

function initializeSocketIO(server) {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id)

      // Join game room
      socket.on('join-game', async ({ roomId, playerName, playersCount }) => {
        try {
          if (!gameRooms.has(roomId)) {
            // Create new game room
            gameRooms.set(roomId, {
              id: roomId,
              players: [],
              currentTurn: 0,
              gameStarted: false,
              maxPlayers: playersCount || 2,
              gameEnded: false,
              statistics: {}
            })
          }

          const room = gameRooms.get(roomId)
          
          // Check if player already exists
          const existingPlayer = room.players.find(p => p.name === playerName)
          if (existingPlayer) {
            existingPlayer.socketId = socket.id
            socket.join(roomId)
            socket.emit('game-state', room)
            return
          }

          // Add new player
          if (room.players.length < room.maxPlayers) {
            const player = {
              id: uuidv4(),
              name: playerName,
              socketId: socket.id,
              joinedAt: new Date()
            }
            
            room.players.push(player)
            socket.join(roomId)

            // Start game if room is full
            if (room.players.length === room.maxPlayers) {
              room.gameStarted = true
            }

            // Initialize statistics for new player
            if (!room.statistics[playerName]) {
              room.statistics[playerName] = {
                totalRolls: 0,
                rollHistory: [],
                diceStats: {
                  1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
                },
                sumStats: {
                  2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0
                }
              }
            }

            io.to(roomId).emit('game-state', room)
          } else {
            socket.emit('room-full')
          }
        } catch (error) {
          console.error('Error joining game:', error)
          socket.emit('error', 'Failed to join game')
        }
      })

      // Roll dice
      socket.on('roll-dice', async ({ roomId, playerName }) => {
        try {
          const room = gameRooms.get(roomId)
          if (!room || room.gameEnded) return

          const currentPlayer = room.players[room.currentTurn]
          if (currentPlayer.name !== playerName) {
            socket.emit('not-your-turn')
            return
          }

          // Generate dice roll
          const dice1 = Math.floor(Math.random() * 6) + 1
          const dice2 = Math.floor(Math.random() * 6) + 1
          const sum = dice1 + dice2

          const rollResult = {
            playerId: currentPlayer.id,
            playerName: playerName,
            dice1,
            dice2,
            sum,
            timestamp: new Date(),
            isRazboyniks: sum === 7
          }

          // Update statistics
          const playerStats = room.statistics[playerName]
          playerStats.totalRolls++
          playerStats.rollHistory.push(rollResult)
          playerStats.diceStats[dice1]++
          playerStats.diceStats[dice2]++
          playerStats.sumStats[sum]++

          // Save to database
          const database = await initializeDatabase()
          await database.collection('dice_rolls').insertOne({
            gameId: roomId,
            ...rollResult
          })

          // Broadcast roll result to all players
          io.to(roomId).emit('dice-rolled', rollResult)

          // Move to next player
          room.currentTurn = (room.currentTurn + 1) % room.players.length

          // Update game state
          io.to(roomId).emit('game-state', room)

        } catch (error) {
          console.error('Error rolling dice:', error)
          socket.emit('error', 'Failed to roll dice')
        }
      })

      // Stop game
      socket.on('stop-game', ({ roomId }) => {
        const room = gameRooms.get(roomId)
        if (room) {
          room.gameEnded = true
          io.to(roomId).emit('game-ended', room)
        }
      })

      // Get statistics
      socket.on('get-statistics', ({ roomId }) => {
        const room = gameRooms.get(roomId)
        if (room) {
          socket.emit('statistics', room.statistics)
        }
      })

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
      })
    })
  }
}

export async function GET(request) {
  return new Response(JSON.stringify({ message: 'Dice Game API is running' }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function POST(request) {
  try {
    const { action, ...data } = await request.json()
    
    switch (action) {
      case 'create-room':
        const roomId = uuidv4()
        return new Response(JSON.stringify({ roomId }), {
          headers: { 'Content-Type': 'application/json' }
        })
      
      case 'get-statistics':
        const database = await initializeDatabase()
        const stats = await database.collection('dice_rolls').find({
          gameId: data.roomId
        }).toArray()
        
        return new Response(JSON.stringify({ statistics: stats }), {
          headers: { 'Content-Type': 'application/json' }
        })
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('API Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Initialize Socket.IO if in development
if (process.env.NODE_ENV === 'development') {
  const { createServer } = require('http')
  const next = require('next')
  
  if (!global.socketInitialized) {
    global.socketInitialized = true
    
    // This is a workaround for development - in production you'd need a proper setup
    const server = createServer()
    initializeSocketIO(server)
    
    const PORT = process.env.SOCKET_PORT || 3001
    server.listen(PORT, () => {
      console.log(`Socket.IO server running on port ${PORT}`)
    })
  }
}