import { useParams } from "react-router";
import useFetch from "../../hooks/useFetch.ts";
import type { Duel } from "../../lib/types/types.ts";


function ViewLogsPage() {
    const API_BASE = "http://localhost:8080"
    const { duelID } = useParams();



    return (
        <>
            <div>{ duelID }</div>
        </>
    );
}

export default ViewLogsPage;