import classes from "./DuelsPageList.module.css";
import DuelCard from "../DuelCard/DuelCard.tsx";
import type { Duel } from "../../lib/types/types.ts";

interface DuelPageListProps {
    duelList: Duel[];
    duelStatus: 'active' | 'completed';
}


function DuelsPageList( { duelList, duelStatus }: DuelPageListProps) {

    return (
        <main className={ classes.listContainer }>
            {duelStatus === 'active' && duelList.filter(duel => duel.status === 'active').map(duel => (
                <DuelCard duel={ duel } key={ duel.id } />
            ))}
            {duelStatus !== 'active' && duelList.filter(duel => duel.status !== 'active').map(duel => (
                <DuelCard duel={ duel } key={ duel.id } />
            ))}
        </main>
    );
}

export default DuelsPageList;