import { useParams } from "react-router";
import { useEffect, useState } from "react";
import LogDuelPageHeader from "../../components/LogDuelPageHeader/LogDuelPageHeader";
import ViewLogsPageControls from "./ViewLogsPageControls";
import classes from "./ViewLogsPage.module.css";
import useFetch from "../../hooks/useFetch.ts";
import type { Log } from "../../lib/types/types.ts";
import { LoaderCircle } from "lucide-react";

declare global {
    interface Window {
        WebApp?: any;
    }
}

function ViewLogsPage() {
    const API_BASE = "https://maxbot-withoutdocker.onrender.com";
    const { duelID } = useParams();

    const [maxId, setMaxId] = useState<string | null>(null); // MAX ID
    const [habitName, setHabitName] = useState<string>("");
    const [toggle, setToggle] = useState<"user" | "opponent">("user");
    const [logs, setLogs] = useState<Log[]>([]);


    useEffect(() => {
        if (!window.WebApp) return;
        window.WebApp.ready();

        const data = window.WebApp.initDataUnsafe;

        if (data?.start_param_max_id) {
            setMaxId(String(data.start_param_max_id));
        }

        if (data?.start_param_habit) {
            setHabitName(data.start_param_habit);
        }
    }, []);


    const { fetching: fetchLogs, isPending: isLogsPending } = useFetch(async () => {
        if (!duelID) return;

        const response = await fetch(
            `${API_BASE}/duel/getDuelLogs?duel_id=${encodeURIComponent(duelID)}`
        );

        if (!response.ok) {
            console.error("Failed to load logs");
            return;
        }

        const raw: Log[] = await response.json();

        const normalized = raw.map(l => ({
            ...l,
            max_id: String(l.max_id),
            log_id: Number(l.log_id),
            duel_id: Number(l.duel_id),
        }));

        const sorted = normalized.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setLogs(sorted);
    });

    useEffect(() => {
        if (duelID && maxId) fetchLogs();
    }, [duelID, maxId]);

    const userLogs = maxId ? logs.filter(l => l.max_id === maxId) : [];
    const opponentLogs = maxId ? logs.filter(l => l.max_id !== maxId) : [];

    return (
        <>
            <LogDuelPageHeader habitName={habitName || "Привычка"} />

            <ViewLogsPageControls
                toggle={toggle}
                setToggle={setToggle}
                userCount={userLogs.length}
                opponentCount={opponentLogs.length}
            />

            {isLogsPending && (
                <div className="loaderCircle">
                    <LoaderCircle className="loaderIcon" />
                </div>
            )}

            {!isLogsPending && logs && (
                <div className={classes.container}>
                    {(toggle === "user" ? userLogs : opponentLogs).map(log => (
                        <div key={log.log_id} className={classes.logCard}>

                            {log.photo && (
                                <img
                                    src={`data:image/jpeg;base64,${log.photo}`}
                                    className={classes.photo}
                                    alt="log"
                                />
                            )}

                            <div className={classes.logContent}>
                                <p className={classes.date}>{log.created_at}</p>
                                <p className={classes.text}>{log.message}</p>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

export default ViewLogsPage;