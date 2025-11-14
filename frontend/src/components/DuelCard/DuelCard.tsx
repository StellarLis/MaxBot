import type { Duel } from "../../lib/types/types.ts";
import classes from "./DuelCard.module.css"
import { Crown } from "lucide-react";
import { Progress } from "radix-ui";
import { Link } from "react-router";

interface DuelCardProps {
    duel: Duel;
}

interface ParticipantProps {
    name: string;
    isLead: boolean;
    score: number;
    targetDays: number;
}

function DuelCard( { duel }: DuelCardProps) {

    return (
        <div
            className={ classes.cardContainer }
        >
            <header>
                <h2 className={ classes.header }>
                    <span className={ classes.title }>{ duel.habit_name }</span>
                    <span className={ classes.category }>{ duel.habit_category }</span>
                </h2>
                {duel.user1_completed > duel.user2_completed && duel.status === 'active' && <p className={classes.leadingStatus}>Впереди</p>}
                {duel.user1_completed === duel.user2_completed && duel.status === 'active' && <p className={classes.tieStatus}>Ничья</p>}
                {duel.user1_completed < duel.user2_completed && duel.status === 'active' && <p className={classes.behindStatus}>Позади</p>}
                {duel.user1_completed > duel.user2_completed && duel.status !== 'active' && <p className={classes.victoryStatus}>Победа</p>}
                {duel.user1_completed === duel.user2_completed && duel.status !== 'active' && <p className={classes.tieStatus}>Ничья</p>}
                {duel.user1_completed < duel.user2_completed && duel.status !== 'active' && <p className={classes.behindStatus}>Поражение</p>}
            </header>
            <Participant
                name={ "Вы" }
                isLead={ duel.user1_completed > duel.user2_completed }
                score={ duel.user1_completed }
                targetDays={ duel.duration_in_days }
            />
            <Participant
                name={ duel.user2_first_name.String }
                isLead={ duel.user1_completed < duel.user2_completed }
                score={ duel.user2_completed }
                targetDays={ duel.duration_in_days }
            />
            <footer className={ classes.footer }>
                <Link className={ classes.viewLogs } to={ `/duelLogs/${duel.id}` }>Посмотреть прогресс</Link>
                { duel.status === 'active' && <Link className={ classes.makeLog } to={ `/logDuel/${duel.id}` }>Зафиксировать прогресс</Link> }
            </footer>
        </div>
    );
}

function Participant( { name, isLead, score, targetDays }: ParticipantProps ) {
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