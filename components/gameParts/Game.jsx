import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Users, BarChart3, RotateCcw } from "lucide-react";
import DiceIcon from "./DiceIcon";
import { useTranslation } from 'react-i18next';

export default function Game(props) {
    const {
        room,
        isConnected,
        lastRoll,
        isRolling,
        myPlayerId,
        getCurrentPlayerId,
        getCurrentPlayerName,
        isMyTurn,
        rollDice,
        viewStatistics,
    } = props;

    const playerList = room ? Object.values(room.players) : [];
    const { t, i18n } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 p-2">
            <div className="w-[98%] mx-auto grid gap-2 mt-5">

                {/* Game Header */}
                <Card className="w-full">
                    <CardHeader className="px-2 py-2 pb-10 text-center space-y-2">
                        <CardTitle className="flex items-center justify-center gap-2 text-lg">
                            {t('gameName')}
                            {isConnected ? (
                                <Wifi className="w-4 h-4 text-green-500" />
                            ) : (
                                <WifiOff className="w-4 h-4 text-red-500" />
                            )}
                        </CardTitle>

                        <CardDescription>
                            {t('room')}:{" "}
                            <code className="bg-gray-100 px-2 py-1 rounded">{room?.id}</code>
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto pb-2 flex justify-center">
                        <Button
                            onClick={viewStatistics}
                            variant="outline"
                            size="sm"
                            className="mx-auto"
                        >
                            <BarChart3 className="w-4 h-4 mr-1" />
                            {t('statistics')}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Players List */}
                <Card className="w-full">
                    <CardContent className="px-2 py-2 pb-10">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                {t('players')} ({playerList.length})
                            </h3>
                            <Badge variant="secondary" className="text-lg px-2 py-1">
                                {t('turn')}: {getCurrentPlayerName()}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {playerList.map((player) => {
                                const isCurrentPlayer = getCurrentPlayerId() === player.id;
                                const isMe = player.id === myPlayerId;

                                return (
                                    <div
                                        key={player.id}
                                        className={`p-2 rounded-lg text-center transition-all ${
                                            isCurrentPlayer
                                                ? "bg-primary text-primary-foreground scale-105 shadow-lg"
                                                : "bg-muted"
                                        }`}
                                    >
                                        <div className="font-medium">{player.name}</div>
                                        {isMe && <div className="text-xs opacity-90 mt-1">👤 {t('you')}</div>}
                                        {isCurrentPlayer && <div className="text-xs opacity-90 mt-1">👆 {t('turn')}</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Dice Area */}
                <Card className="w-full">
                    <CardContent className="px-2 py-2 pb-10">
                        <div className="text-center space-y-4">
                            {/* Dice Display */}
                            <div className="flex justify-center gap-6">
                                <div className={`transition-all duration-1000 ${isRolling ? "animate-spin" : ""}`}>
                                    <DiceIcon value={lastRoll?.dice1 || 1} className="w-20 h-20 text-primary drop-shadow-lg"/>
                                </div>
                                <div className={`transition-all duration-1000 ${isRolling ? "animate-spin" : ""}`}>
                                    <DiceIcon value={lastRoll?.dice2 || 1} className="w-20 h-20 text-primary drop-shadow-lg"/>
                                </div>
                            </div>

                            {/* Last Roll Result */}
                            {lastRoll && (
                                <div className="space-y-1">
                                    <div className="text-2xl font-bold">
                                        {lastRoll.dice1} + {lastRoll.dice2} = {lastRoll.sum}
                                    </div>
                                    <div className="text-base text-muted-foreground">
                                        {t('threw')}: <strong>{lastRoll.playerName}</strong>
                                    </div>
                                    {lastRoll.is_razboyniks && (
                                        <Badge variant="destructive" className="text-base px-4 py-2 animate-pulse">
                                            {t('robbers')} 🏴‍☠️
                                        </Badge>
                                    )}
                                </div>
                            )}

                            {/* Roll Button */}
                            <div className="space-y-2">
                                <Button
                                    onClick={rollDice}
                                    disabled={!isMyTurn() || isRolling || !isConnected}
                                    size="lg"
                                    className="px-8 py-4 text-lg font-bold shadow-lg hover:scale-105 transition-transform"
                                >
                                    {isRolling ? (
                                        <>
                                            <RotateCcw className="w-5 h-5 mr-2 animate-spin"/>
                                            {t('rollingDice')}...
                                        </>
                                    ) : isMyTurn() ? (
                                        <>🎲 {t('rollDice')}</>
                                    ) : (
                                        <>{t('waitForYourTurn')}</>
                                    )}
                                </Button>

                                <div className="text-muted-foreground text-sm">
                                    {isMyTurn() ? (
                                        <p className="text-green-600 font-semibold">🎯 {t('yourTurn')}</p>
                                    ) : (
                                        <p>{t('playersTurnNow')}: <strong>{getCurrentPlayerName()}</strong></p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
