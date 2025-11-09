import classes from "./DuelsPageHeaderStats.module.css"
import { useState } from "react";
import StatCard from "./StatCard.tsx";
import { Flame, Star, Trophy } from "lucide-react";

function DuelsPageHeaderStats() {
    const [winsCount, setWinsCount] = useState<number>(0);
    const [activeDuels, setActiveDuels] = useState<number>(0);
    const [winRate, setWinRate] = useState<number>(0);

    const winsCountColors = {
        "iconColor": "#9810fa",
        "textColor": "#59168b"
    }

    const activeDuelsColors = {
        "iconColor": "#f54a00",
        "textColor": "#7e2a0c"
    }

    const winRateColors = {
        "iconColor": "#0b48fb",
        "textColor": "#1c398e"
    }

    return (
        <div className={classes.statsContainer}>
            <StatCard
                Icon={ Trophy }
                title={ "Wins" }
                value={ winsCount }
                colors={ winsCountColors }
            />
            <StatCard
                Icon={ Flame }
                title={ "Active" }
                value={ activeDuels }
                colors={ activeDuelsColors }
            />
            <StatCard
                Icon={ Star }
                title={ "Win Rate" }
                value={ winRate }
                colors={ winRateColors }
            />
        </div>
    );
}

export default DuelsPageHeaderStats;