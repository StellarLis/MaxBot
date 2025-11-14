import classes from "./DuelsPageHeaderStats.module.css"
import StatCard from "./StatCard.tsx";
import { Flame, Star, Trophy } from "lucide-react";

interface DuelsPageHeaderStatsProps {
    winsCount: number;
    activeDuels: number;
    winRate: number;
}

function DuelsPageHeaderStats( { winsCount, activeDuels, winRate}: DuelsPageHeaderStatsProps) {

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
                title={ "Победы" }
                value={ winsCount }
                colors={ winsCountColors }
            />
            <StatCard
                Icon={ Flame }
                title={ "Серия" }
                value={ activeDuels }
                colors={ activeDuelsColors }
            />
            <StatCard
                Icon={ Star }
                title={ "Доля побед" }
                value={ winRate }
                colors={ winRateColors }
            />
        </div>
    );
}

export default DuelsPageHeaderStats;