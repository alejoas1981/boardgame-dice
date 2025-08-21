import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Check, Copy } from "lucide-react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import { useTranslation } from 'react-i18next';

export default function Lobby(props) {
    const {
        room,
        roomIdCopied,
        copyRoomId,
        localPlayerList,
        myPlayerId,
        sensors,
        handleDragEnd,
        startGame,
        resetGame
    } = props;
    const { t, i18n } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                        <Users className="w-6 h-6"/>
                        {t('waitingForPlayers')}
                    </CardTitle>
                    <CardDescription>
                        {t('room')}: <code className="bg-gray-100 px-2 py-1 rounded">{room?.id}</code>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={copyRoomId}
                            className="ml-2 h-6 w-6 p-0"
                        >
                            {roomIdCopied ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>}
                        </Button>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext
                            items={localPlayerList.filter(p => p && p.id).map(p => p.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                                {localPlayerList.filter(p => p && p.id).map((player, index) => (
                                    <SortableItem key={player.id} id={player.id}>
                                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{player.name}</span>
                                                {player.id === myPlayerId && (
                                                    <Badge variant="secondary" className="text-xs">{t('you')}</Badge>
                                                )}
                                            </div>
                                            <Badge variant="outline">{t('player')} {index + 1}</Badge>
                                        </div>
                                    </SortableItem>
                                ))}

                                {Array.from({ length: (room?.maxPlayers || 2) - localPlayerList.length }).map((_, index) => (
                                    <div key={`empty-${index}`}
                                         className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border-2 border-dashed">
                                        <span className="text-muted-foreground">{t('waitingForPlayer')}...</span>
                                        <Badge variant="outline">{t('empty')}</Badge>
                                    </div>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    <div className="mt-6 space-y-2">
                        {localPlayerList.length >= 2 && (
                            <Button onClick={startGame} className="w-full">
                                {t('startGame')} ({localPlayerList.length} {t('playersGenitive')})
                            </Button>
                        )}
                        <Button onClick={resetGame} variant="outline" className="w-full">
                            {t('backToSettings')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
