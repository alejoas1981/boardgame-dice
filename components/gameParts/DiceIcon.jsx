import React from "react";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";

export default function DiceIcon({ value, className = "w-16 h-16" }) {
    const icons = {
        1: Dice1,
        2: Dice2,
        3: Dice3,
        4: Dice4,
        5: Dice5,
        6: Dice6,
    };

    const Icon = icons[value] || Dice1;

    return <Icon className={className} />;
}
