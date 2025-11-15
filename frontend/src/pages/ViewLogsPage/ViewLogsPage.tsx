import { useParams } from "react-router";
import { useEffect, useState } from "react";
import LogDuelPageHeader from "../../components/LogDuelPageHeader/LogDuelPageHeader";
import ViewLogsPageControls from "./ViewLogsPageControls";
import classes from "./ViewLogsPage.module.css";
import useFetch from "../../hooks/useFetch.ts";
import type { Log } from "../../lib/types/types.ts";
import { LoaderCircle } from "lucide-react";


function ViewLogsPage() {
    const API_BASE = "http://localhost:8080";

    const { duelID } = useParams();
    const userID = 1;

    const [toggle, setToggle] = useState<"user" | "opponent">("user");
    const [logs, setLogs] = useState<Log[]>([]);

    const { fetching: fetchLogs, isPending: isLogsPending } = useFetch(async () => {
        const response = await fetch(`${API_BASE}/duel/getDuelLogs?id=1`);
        const data: Log[] = await response.json();

        let result: Log[] = [];
        for (const log of data) {
            if (log.duel_id === Number(duelID)) {
                result.push(log);
            }
        }
        setLogs(result);
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <>
            <LogDuelPageHeader habitName="Soccer" />

            <ViewLogsPageControls
                toggle={toggle}
                setToggle={setToggle}
                userCount={logs.length}
                opponentCount={logs.filter(log => log.owner_id !== userID).length}
            />

            { isLogsPending && <div className="loaderCircle"><LoaderCircle className="loaderIcon" /></div> }
            { logs && <div className={classes.container}>
                { toggle === "user" && logs.filter(log => log.owner_id === userID).map(log => (
                    <div key={log.log_id} className={classes.logCard}>
                        <img src={`data:image/jpeg;base64,${log.photo}`} className={classes.photo} alt="" />
                        <div className={classes.logContent}>
                            <p className={classes.date}>{log.created_at}</p>
                            <p className={classes.text}>{log.message}</p>
                        </div>
                    </div>
                ))}
            </div> }
        </>
    );
}

export default ViewLogsPage;