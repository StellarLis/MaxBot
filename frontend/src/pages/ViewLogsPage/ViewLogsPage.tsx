import { useParams } from "react-router";
import useFetch from "../../hooks/useFetch.ts";
import type {Duel} from "../../lib/types/types.ts";


function ViewLogsPage() {
    const API_BASE = "http://localhost:8080"

    const { duelID } = useParams();
    const { data: duel, isPending, error } = useFetch<Duel>(`${API_BASE}/duel/getDuelLogs?user_id=MAXID_1`);

    console.log(duel);

    return (
        <>
            <div>{ duelID }</div>
        </>
    );
}

export default ViewLogsPage;