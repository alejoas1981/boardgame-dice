import React from "react";
import { Skull } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function Razboyniks({ lastRoll }) {
    const { t, i18n } = useTranslation();
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-2">
            <div className="text-center space-y-6 animate-pulse w-full max-w-sm">
                <img
                    src="https://images.unsplash.com/photo-1584772988869-dccc362700a6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHx3ZXN0ZXJuJTIwYmFuZGl0c3xlbnwwfHx8fDE3NTUwOTIyNzh8MA&ixlib=rb-4.1.0&q=85"
                    alt={t('robbers')}
                    className="w-full max-w-xs aspect-square object-cover rounded-lg mx-auto shadow-2xl border-4 border-red-500"
                />
                <div className="text-4xl sm:text-6xl font-bold text-red-500 animate-bounce">
                    {t('robbers')}!
                </div>
                <div className="text-lg sm:text-2xl text-white px-2">
                    <>
                        {lastRoll.playerName} {t('threw')}: {lastRoll.dice1} + {lastRoll.dice2} = {lastRoll.sum}
                    </>
                </div>
                <Skull className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto animate-spin" />
            </div>
        </div>
    );
}
