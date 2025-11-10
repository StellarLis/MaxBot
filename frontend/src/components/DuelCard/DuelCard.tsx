import type { Duel } from "../../lib/types/types.ts";
import classes from "./DuelCard.module.css"
import { Crown, Flame } from "lucide-react";
import { Progress } from "radix-ui";

interface DuelCardProps {
    duel: Duel;
}

interface ParticipantProps {
    name: string;
    isLead: boolean;
    score: number;
    targetDays: number;
    streak: number;
}

function DuelCard( { duel }: DuelCardProps) {

    return (
        <div
            className={ classes.cardContainer }
            style={duel.status === "won"
                ? {backgroundColor: "#e9fdef"}
                : duel.status === "tied"
                    ? {backgroundColor: "#eff6ff"}
                    : {backgroundColor: "#fff"}
            }
        >
            <header>
                <h2 className={ classes.header }>
                    <span className={ classes.title }>{ duel.habitName }</span>
                    <span className={ classes.category }>{ duel.category }</span>
                </h2>
                {duel.userProgress > duel.opponentProgress && duel.status === 'active' && <p className={classes.leadingStatus}>Впереди</p>}
                {duel.userProgress === duel.opponentProgress && duel.status === 'active' && <p className={classes.tieStatus}>Ничья</p>}
                {duel.userProgress < duel.opponentProgress && duel.status === 'active' && <p className={classes.behindStatus}>Позади</p>}
                {duel.userProgress > duel.opponentProgress && duel.status !== 'active' && <p className={classes.leadingStatus}>Победа</p>}
                {duel.userProgress === duel.opponentProgress && duel.status !== 'active' && <p className={classes.tieStatus}>Ничья</p>}
                {duel.userProgress < duel.opponentProgress && duel.status !== 'active' && <p className={classes.behindStatus}>Поражение</p>}
            </header>
            <Participant
                name={ "Вы" }
                isLead={ duel.userProgress > duel.opponentProgress }
                score={ duel.userProgress }
                targetDays={ duel.targetDays }
                streak={ duel.userStreak }
            />
            <Participant
                name={ duel.opponentName }
                isLead={ duel.userProgress < duel.opponentProgress }
                score={ duel.opponentProgress }
                targetDays={ duel.targetDays }
                streak={ duel.opponentStreak }
            />
        </div>
    );
}

function Participant( { name, isLead, score, targetDays, streak }: ParticipantProps ) {
    const isUser: boolean = name === "Вы";
    const progressPercentage: number = score / targetDays * 100;

    return (
        <>
            <div className={ classes.participantContainer }>
                <div className={ classes.profile }>
                    <div className={ isUser ? classes.userAvatar : classes.oppAvatar }>OP</div>
                    <p className={ classes.name }>{ name }</p>
                    { isLead && <Crown className={ classes.leadIcon } /> }
                </div>
                <div className={ classes.stats }>
                    <p className={ classes.score }>{ score }/{ targetDays }</p>
                    <span className={ isUser ? classes.userStreakStat : classes.oppStreakStat }>
                    <Flame className={ isUser ? classes.userStreakIcon : classes.oppStreakIcon } />
                        { streak }
                </span>
                </div>
            </div>
            <Progress.Root
                className={ classes.progressRoot }
                value={ progressPercentage }
            >
                <Progress.Indicator
                    className={ classes.progressIndicator }
                    style={{ transform: `translateX(-${100 - progressPercentage}%)` }}
                />
            </Progress.Root>
        </>
    );
}

export default DuelCard;