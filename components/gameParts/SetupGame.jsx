import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Check, Copy } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function SetupGame(props) {
    const {
        isConnected,
        connectionError,
        playerName,
        setPlayerName,
        playersCount,
        setPlayersCount,
        roomId,
        setRoomId,
        isRoomCreated,
        createRoom,
        copyRoomId,
        roomIdCopied,
        joinRoom
    } = props;
    const { t, i18n } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                        {t('gameName')}
                    </CardTitle>
                    <CardDescription>
                        {t('multiplayerBoardGameHelper')}
                    </CardDescription>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        {isConnected ? (
                            <>
                                <Wifi className="w-4 h-4 text-green-500"/>
                                <span className="text-sm text-green-600">{t('connectedToServer')}</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="w-4 h-4 text-red-500"/>
                                <span className="text-sm text-red-600">
                  {connectionError || t('connectingToServer') }
                </span>
                            </>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('yourName')}</label>
                        <Input
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder={t('enterYourName')}
                            maxLength={20}
                        />
                    </div>

                    {!isRoomCreated && (
                        <div>
                            <label className="block text-sm font-medium mb-2">{t('numberOfPlayers')}</label>
                            <div className="flex gap-2">
                                {[2, 3, 4, 5, 6].map(num => (
                                    <Button
                                        key={num}
                                        variant={playersCount === num ? "default" : "outline"}
                                        onClick={() => setPlayersCount(num)}
                                        className="flex-1"
                                    >
                                        {num}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2">{t('roomName')}</label>
                        {!isRoomCreated && (
                            <div className="flex gap-2">
                                <Input
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                                    placeholder={t('enterName')}
                                    maxLength={10}
                                />
                                <Button onClick={createRoom} variant="outline" disabled={!isConnected}>
                                    {t('create')}
                                </Button>
                            </div>
                        )}
                        {roomId && (
                            <div className="flex items-center gap-2 mt-2">
                                <code className="bg-gray-100 px-2 py-1 rounded text-sm">{roomId}</code>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={copyRoomId}
                                    className="h-6 w-6 p-0"
                                >
                                    {roomIdCopied ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>}
                                </Button>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={joinRoom}
                        className="w-full"
                        disabled={!isConnected || !playerName || !roomId}
                    >
                        {t('joinGame')}
                    </Button>

                    {!isConnected && (
                        <p className="text-center text-sm text-gray-600">
                            {t('waitingForServerConnection')}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
