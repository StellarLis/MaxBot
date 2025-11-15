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

    const [maxId, setMaxId] = useState<string | null>(null);
    const [habitName, setHabitName] = useState<string>("");

    const [toggle, setToggle] = useState<"user" | "opponent">("user");
    const [logs, setLogs] = useState<Log[]>([]);

    const numericId = maxId ? Number(maxId) : null;

    useEffect(() => {
        if (!window.WebApp) return;
        window.WebApp.ready();
        const d = window.WebApp.initDataUnsafe;
        if (d?.user) setMaxId(d.user.id);
        if (d?.start_param_habit) setHabitName(d.start_param_habit);
    }, []);

    const { fetching: fetchLogs, isPending: isLogsPending } = useFetch(async () => {
        if (!maxId) return;

        const response = await fetch(
            `${API_BASE}/duel/getDuelLogs?max_id=${encodeURIComponent(maxId)}&duel_id=${encodeURIComponent(duelID!)}`
        );

        const data: Log[] = await response.json();
        setLogs(data);
    });

    useEffect(() => {
        if (maxId) fetchLogs();
    }, [maxId]);

    return (
        <>
            <LogDuelPageHeader habitName={habitName || "Привычка"} />

            <ViewLogsPageControls
                toggle={toggle}
                setToggle={setToggle}
                userCount={numericId !== null ? logs.filter(l => l.owner_id === numericId).length : 0}
                opponentCount={numericId !== null ? logs.filter(l => l.owner_id !== numericId).length : 0}
            />

            {isLogsPending && (
                <div className="loaderCircle"><LoaderCircle className="loaderIcon"/></div>
            )}

            {logs &&
                <div className={classes.container}>

                    {toggle === "user" &&
                        numericId !== null &&
                        logs
                            .filter(log => log.owner_id === numericId)
                            .map(log => (
                                <div key={log.log_id} className={classes.logCard}>
                                    {log.photo && (
                                        <img
                                            src={`data:image/jpeg;base64,${log.photo}`}
                                            className={classes.photo}
                                            alt=""
                                        />
                                    )}
                                    <div className={classes.logContent}>
                                        <p className={classes.date}>{log.created_at}</p>
                                        <p className={classes.text}>{log.message}</p>
                                    </div>
                                </div>
                            ))
                    }

                    {toggle === "opponent" &&
                        numericId !== null &&
                        logs
                            .filter(log => log.owner_id !== numericId)
                            .map(log => (
                                <div key={log.log_id} className={classes.logCard}>
                                    {log.photo && (
                                        <img
                                            src={`data:image/jpeg;base64,${log.photo}`}
                                            className={classes.photo}
                                            alt=""
                                        />
                                    )}
                                    <div className={classes.logContent}>
                                        <p className={classes.date}>{log.created_at}</p>
                                        <p className={classes.text}>{log.message}</p>
                                    </div>
                                </div>
                            ))
                    }

                </div>
            }
        </>
    );
}

export default ViewLogsPage;