import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {BarChart3, Trophy, RotateCcw} from "lucide-react";
import DiceIcon from "./DiceIcon";
import { useTranslation } from 'react-i18next';

export default function Statistics(props) {
    const { room, statistics, getMyPlayerName, setGameState, resetGame } = props;
    const { t, i18n } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-2">
            <div className="w-[98%] mx-auto grid gap-2 mt-5">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-2">
                            <BarChart3 className="w-6 h-6"/>
                            {t('gameStatistics')}
                        </CardTitle>
                        <CardDescription>{t('room')}: {room?.id}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="players">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="players">{t('byPlayers')}</TabsTrigger>
                                <TabsTrigger value="overall">{t('overall')}</TabsTrigger>
                            </TabsList>

                            <TabsContent value="players" className="space-y-4">
                                {Object.entries(statistics).filter(([key]) => key !== 'razboyniksCount').map(([playerName, stats]) => (
                                    <Card key={playerName}>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {playerName}
                                                {playerName === getMyPlayerName() && (
                                                    <Badge variant="secondary">{t('you')}</Badge>
                                                )}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-semibold mb-2 text-center">{t('diceRolls')}</h4>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {[1,2,3,4,5,6].map(num => (
                                                            <div key={num} className="text-center p-2 bg-muted rounded">
                                                                <DiceIcon value={num} className="w-6 h-6 mx-auto mb-1"/>
                                                                <div className="text-sm font-bold">{stats.diceStats?.[num] || 0}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold mb-2 text-center">{t('sums')}</h4>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {[2,3,4,5,6,7,8,9,10,11,12].map(sum => (
                                                            <div key={sum} className={`text-center p-2 rounded ${sum === 7 ? 'bg-red-100 text-red-700 font-bold' : 'bg-muted'}`}>
                                                                <div className="font-bold text-sm">{sum}</div>
                                                                <div className="text-xs">{stats.sumStats?.[sum] || 0}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 text-center space-x-2">
                                                <Badge variant="secondary" className="text-base px-4 py-2">
                                                    {t('totalRolls')}: {stats.totalRolls || 0}
                                                </Badge>
                                                {(stats.sumStats?.[7] || 0) > 0 && (
                                                    <Badge variant="destructive" className="px-4 py-2">
                                                        {t('robbers')}: {stats.sumStats[7]}🏴‍☠️
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </TabsContent>

                            <TabsContent value="overall" className="text-center py-8">
                                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4"/>
                                <div className="space-y-2">
                                    <p className="text-lg font-semibold">{t('roomOverallStatistics')}</p>
                                    <p>{t('totalPlayers')}: {room ? Object.keys(room.players).length : 0}</p>
                                    <p>{t('totalRobbers')}: {room?.statistics?.razboyniksCount || 0}</p>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="flex gap-2 mt-6">
                            <Button onClick={() => setGameState('game')} className="flex-1">
                                {t('backToGame')}
                            </Button>
                            <Button onClick={resetGame} variant="destructive" className="flex-1">
                                <RotateCcw className="w-4 h-4 mr-2"/>
                                {t('exit')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
