'use client'

import {useState, useEffect, useRef} from 'react'
import {io} from 'socket.io-client'
import {
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

// Game components
import SetupGame from '@/components/gameParts/SetupGame'
import Lobby from '@/components/gameParts/Lobby'
import Razboyniks from "@/components/gameParts/Razboyniks";
import Statistics from "@/components/gameParts/Statistics";
import Game from "@/components/gameParts/Game";

export default function OnlineDiceGame() {
    // Socket connection
    const [socket, setSocket] = useState(null)
    const [isConnected, setIsConnected] = useState(false)
    const [connectionError, setConnectionError] = useState(null)

    // Game states
    const [gameState, setGameState] = useState('setup') // setup, lobby, game, razboyniks, statistics
    const [room, setRoom] = useState(null)
    const [myPlayerId, setMyPlayerId] = useState(null)
    const [lastRoll, setLastRoll] = useState(null)
    const [isRolling, setIsRolling] = useState(false)
    const [statistics, setStatistics] = useState({})
    const [showRazboyniks, setShowRazboyniks] = useState(false)
    const [playerList, setPlayerList] = useState(room ? Object.values(room.players) : [])

    // Setup form
    const [playerName, setPlayerName] = useState('')
    const [roomId, setRoomId] = useState('')
    const  [isRoomCreated, setIsRoomCreated] = useState(false)
    const [playersCount, setPlayersCount] = useState(2)
    const [roomIdCopied, setRoomIdCopied] = useState(false)

    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor)
    )
    const [localPlayerList, setLocalPlayerList] = useState([])
    useEffect(() => {
        if (room?.players) setLocalPlayerList(Object.values(room.players))
    }, [room])

    // Socket connection setup
    useEffect(() => {
        const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
        const socketConnection = io(serverUrl, {
            transports: ['websocket', 'polling'],
            timeout: 10000,
            forceNew: true
        })

        setSocket(socketConnection)

        // Connection events
        socketConnection.on('connect', () => {
            console.log('🔌 Connected to server:', socketConnection.id)
            setIsConnected(true)
            setConnectionError(null)
        })

        socketConnection.on('disconnect', (reason) => {
            console.log('🔌 Disconnected:', reason)
            setIsConnected(false)
            if (reason === 'io server disconnect') {
                socketConnection.connect()
            }
        })

        socketConnection.on('connect_error', (error) => {
            console.error('🔌 Connection error:', error)
            setIsConnected(false)
            setConnectionError('Failed to connect to server')
        })

        // Game events
        socketConnection.on('room-created', (data) => {
            console.log('🚪 Room created:', data.roomId)
            setRoomId(data.roomId)
            setIsRoomCreated(true)
        })

        socketConnection.on('player-connected', (data) => {
            console.log('👤 My player ID:', data.player.id)
            setMyPlayerId(data.player.id)
        })

        socketConnection.on('player_joined', (data) => {
            console.log('👤 Player joined:', data.player.name)
            setRoom(data.room)
            setGameState('lobby')
            setPlayerList(Object.values(data.room.players))
        })

        socketConnection.on('dice-rolled', (data) => {
            console.log('🎲 Dice rolled:', data.rollResult.sum)
            setLastRoll(data.rollResult)
            setIsRolling(false)
            // isRazboyniks
            if (data.rollResult.isRazboyniks) {
                setShowRazboyniks(true)
                setTimeout(() => {
                    setShowRazboyniks(false)
                }, 3000)
            }
        });
        socketConnection.on('game-state', (room) => setRoom(room));

        socketConnection.on('game-started', (data) => {
            console.log('👤 Game Started:')
            setGameState('game')
        })

        socketConnection.on('statistics_data', (data) => {
            setRoom(data.room)
            setStatistics(data.statistics)
            setGameState('statistics')
        })

        socketConnection.on('user-left-room', (data) => {
            setRoom(data.room)
            if(data.room.players.length < data.room.maxPlayers) {
                setGameState('setup')
                setRoom(null)
                setLastRoll(null)
                setPlayerName('')
                setMyPlayerId('')
                setRoomId('')
                setStatistics({})
                setIsRoomCreated(false)
            }
        })

        socketConnection.on('error', (error) => {
            console.error('❌ Server error:', error.message)
            alert(error.message)
        })

        return () => {
            console.log('🔌 Cleaning up socket connection')
            socketConnection.disconnect()
        }
    }, [])

    // Game actions
    const createRoom = () => {
        if (socket && isConnected) {
            socket.emit('create-room', {playersCount: playersCount, roomId: roomId})
        }
    }

    const joinRoom = () => {
        if (playerName) {
            socket.emit('join-game', {
                roomId,
                playerName,
                playersCount: playersCount
            })
            console.log('🔑 Joining room:', roomId, 'as', playerName)
        }
    }

    const startGame = () => {
        if (socket && isConnected) {
            socket.emit('start_game', {roomId})
        }
    }

    const rollDice = () => {
        if (socket && isConnected && !isRolling) {
            setIsRolling(true)
            socket.emit('roll-dice', {roomId, playerName})
        }
    }

    const viewStatistics = () => {
        if (socket && isConnected) {
            socket.emit('get-statistics', {roomId})
        }
    }

    const resetGame = () => {
        setGameState('setup')
        setRoom(null)
        setLastRoll(null)
        setPlayerName('')
        setMyPlayerId('')
        setRoomId('')
        setStatistics({})
        setIsRoomCreated(false)
        socket.emit('player-left', {roomId, myPlayerId})
    }

    const copyRoomId = () => {
        if (roomId) {
            navigator.clipboard.writeText(roomId)
            setRoomIdCopied(true)
            setTimeout(() => setRoomIdCopied(false), 2000);

        }
    }

    // Helper functions
    const getCurrentPlayerName = () => {
        if (!room || !room.players) return ''
        const playerList = room.players
        const currentIndex = room?.currentTurn || 0
        return playerList[currentIndex]?.name || ''
    }

    const getCurrentPlayerId = () => {
        if (!room || !room.players) return ''

        const playerList = room.players
        const currentIndex = room?.currentTurn || 0
        return playerList[currentIndex]?.id || ''
    }

    const isMyTurn = () => {
        return getCurrentPlayerId() === myPlayerId
    }

    const getMyPlayerName = () => {
        return room?.players?.[myPlayerId]?.name || playerName
    }

    const handleDragEnd = (event) => {
        const { active, over } = event
        if (!over) return
        const oldIndex = playerList.findIndex(p => p.id === active.id)
        const newIndex = playerList.findIndex(p => p.id === over.id)
        if (oldIndex === -1 || newIndex === -1) return

        const newOrder = arrayMove(playerList, oldIndex, newIndex)
        setPlayerList(newOrder)
        socket.emit('reorder-players', { roomId: room.id, players: newOrder.map(p => p.id) })
    }

    // Setup Screen
    if (gameState === 'setup') {
        return (
            <SetupGame
                isConnected={isConnected}
                connectionError={connectionError}
                playerName={playerName}
                setPlayerName={setPlayerName}
                playersCount={playersCount}
                setPlayersCount={setPlayersCount}
                roomId={roomId}
                setRoomId={setRoomId}
                isRoomCreated={isRoomCreated}
                createRoom={createRoom}
                copyRoomId={copyRoomId}
                roomIdCopied={roomIdCopied}
                joinRoom={joinRoom}
            />
        )
    }

    // Lobby Screen
    if (gameState === 'lobby') {
        return (
            <Lobby
                room={room}
                roomIdCopied={roomIdCopied}
                copyRoomId={copyRoomId}
                localPlayerList={localPlayerList}
                myPlayerId={myPlayerId}
                sensors={sensors}
                handleDragEnd={handleDragEnd}
                startGame={startGame}
                resetGame={resetGame}
            />
        )
    }

    // Razboyniks Screen
    if (showRazboyniks) {
        return <Razboyniks lastRoll={lastRoll} />;
    }

    // Statistics Screen
    if (gameState === 'statistics') {
        console.log("room ..... ", room)
        return (
            <Statistics
                room={room}
                statistics={statistics}
                getMyPlayerName={getMyPlayerName}
                setGameState={setGameState}
                resetGame={resetGame}
            />
        )
    }

    // Game Screen
    if(gameState === 'game') {
        return (
            <Game
                room={room}
                isConnected={isConnected}
                lastRoll={lastRoll}
                isRolling={isRolling}
                myPlayerId={myPlayerId}
                getCurrentPlayerId={getCurrentPlayerId}
                getCurrentPlayerName={getCurrentPlayerName}
                isMyTurn={isMyTurn}
                rollDice={rollDice}
                viewStatistics={viewStatistics}
            />
        )
    }
}