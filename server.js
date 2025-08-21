const {createServer} = require('http');
const {Server} = require('socket.io');
const next = require('next');
const {MongoClient} = require('mongodb');
const {v4: uuidv4} = require('uuid');
const { randomInt } = require('crypto')

const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();

// Game state storage
const gameRooms = new Map()

app.prepare().then(() => {
    const server = createServer((req, res) => {
        handle(req, res).catch(err => {
            console.error('Next handle error:', err)
            res.statusCode = 500
            res.end('Internal Server Error')
        })
    });

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id)

        // Join game room
        socket.on('join-game', async ({roomId, playerName, playersCount}) => {
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
                    console.log('Room joined: 1', room.players)
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
                    socket.emit('player-connected', {player, room})
                    io.to(roomId).emit('player_joined', {player, room})
                } else {
                    socket.emit('room-full')
                }
            } catch (error) {
                console.error('Error joining game:', error)
                socket.emit('error', 'Failed to join game')
            }
        })

        socket.on('create-room', ({playersCount, roomId}) => {
            gameRooms.set(roomId, {
                id: roomId,
                players: [],
                currentTurn: 0,
                gameStarted: false,
                maxPlayers: playersCount || 2,
                gameEnded: false,
                statistics: {}
            })

            io.emit('room-created', {roomId})
            // Update game state
            const room = gameRooms.get(roomId)
            io.to(roomId).emit('game-state', room)
        })

        const makeDiceShoe = () => {
            const shoe = []
            for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) shoe.push([a, b])
            for (let i = shoe.length - 1; i > 0; i--) {
                const j = randomInt(0, i + 1)
                ;[shoe[i], shoe[j]] = [shoe[j], shoe[i]]
            }
            return shoe
        }

        const drawDicePair = (room) => {
            if (!room.diceShoe || room.diceShoe.length === 0) room.diceShoe = makeDiceShoe()
            return room.diceShoe.pop()
        }

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

                const [dice1, dice2] = drawDicePair(room)
                const sum = dice1 + dice2

                const rollResult = {
                    playerId: currentPlayer.id,
                    playerName,
                    dice1,
                    dice2,
                    sum,
                    timestamp: new Date(),
                    isRazboyniks: sum === 7
                }

                const playerStats = room.statistics[playerName]
                playerStats.totalRolls++
                playerStats.rollHistory.push(rollResult)
                playerStats.diceStats[dice1]++
                playerStats.diceStats[dice2]++
                playerStats.sumStats[sum]++

                if (!room.statistics.razboyniksCount) room.statistics.razboyniksCount = 0
                if (sum === 7) room.statistics.razboyniksCount++

                if (!room.rollHistory) room.rollHistory = []
                room.rollHistory.push(rollResult)

                io.to(roomId).emit('dice-rolled', { rollResult })

                room.currentTurn = (room.currentTurn + 1) % room.players.length

                io.to(roomId).emit('game-state', room)
            } catch (error) {
                console.error('Error rolling dice:', error)
                socket.emit('error', 'Failed to roll dice')
            }
        })

        // Start game
        socket.on('start_game', ({roomId}) => {
            const room = gameRooms.get(roomId)
            if (room) {
                room.gameStarted = true
                io.to(roomId).emit('game-started', room)
                io.to(roomId).emit('game-state', room)
            }
        })

        socket.on('reorder-players', ({roomId, players}) => {
            const room = gameRooms.get(roomId)
            if (!room || !room.players) return

            room.players = players.map(id => room.players.find(p => p.id === id)).filter(Boolean)

            io.to(roomId).emit('game-state', room)
        })

        // Get statistics // Stop game
        socket.on('get-statistics', ({roomId}) => {
            const room = gameRooms.get(roomId)
            if (room) {
                socket.emit('statistics_data', room)
                io.to(roomId).emit('game-state', room)
            }
        })

        // Helper: remove a player from a room and fix turn pointer
        function removePlayerFromRoom(room, predicate) {
            const idx = room.players.findIndex(predicate);
            if (idx === -1) {
                return {removed: null, roomDeleted: false};
            }

            const [removed] = room.players.splice(idx, 1);

            // Drop per-player statistics keyed by name if present
            if (removed && removed.name && room.statistics && room.statistics[removed.name]) {
                delete room.statistics[removed.name];
            }

            // Fix currentTurn pointer
            if (room.players.length === 0) {
                room.currentTurn = 0;
            } else if (idx < room.currentTurn) {
                room.currentTurn -= 1;
            } else if (room.currentTurn >= room.players.length) {
                room.currentTurn = 0;
            }

            // If room was "started" only when full, leaving implies it's no longer full
            if (room.players.length < room.maxPlayers) {
                room.gameStarted = false;
            }

            return {removed, roomDeleted: room.players.length === 0};
        }

        // User Left a room
        socket.on('player-left', ({roomId, myPlayerId}) => {
            const room = gameRooms.get(roomId);
            if (!room) {
                socket.emit('error', 'Room not found');
                return;
            }

            const {removed} = removePlayerFromRoom(
                room,
                p => p.id === myPlayerId || p.socketId === socket.id
            );

            if (!removed) {
                socket.emit('error', 'Player not found in room');
                return;
            }

            // Notify others in the room
            // If nobody left, delete room
            if (room.players.length < 2) {
                io.emit('user-left-room', {playerId: removed.id, playerName: removed.name, room});
                socket.leave(roomId);
                gameRooms.delete(roomId);
            } else {
                // Send fresh state
                io.to(roomId).emit('game-state', room);
                socket.emit('user-left-room', {playerId: removed.id, playerName: removed.name, room});
            }
        })

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id)
        })
    })

    const PORT = process.env.SOCKET_PORT || 3001
    server.listen(PORT, () => {
        console.log(`Socket.IO server running on port ${PORT}`)
    })

});