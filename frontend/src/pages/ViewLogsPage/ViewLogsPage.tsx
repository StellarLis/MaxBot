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

    useEffect(() => {
        if (!window.WebApp) return;
        window.WebApp.ready();

        const d = window.WebApp.initDataUnsafe;

        if (d?.user) setMaxId(String(d.user.id));
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

    const isMyLog = (log: Log) =>
        maxId !== null && String(log.owner_id) === String(maxId);

    const isOpponentLog = (log: Log) =>
        maxId !== null && String(log.owner_id) !== String(maxId);

    return (
        <>
            <LogDuelPageHeader habitName={habitName || "Привычка"} />

            <ViewLogsPageControls
                toggle={toggle}
                setToggle={setToggle}
                userCount={logs.filter(isMyLog).length}
                opponentCount={logs.filter(isOpponentLog).length}
            />

            {isLogsPending && (
                <div className="loaderCircle"><LoaderCircle className="loaderIcon" /></div>
            )}

            <div className={classes.container}>
                {toggle === "user" &&
                    logs.filter(isMyLog).map(log => (
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
                    logs.filter(isOpponentLog).map(log => (
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
        </>
    );
}

export default ViewLogsPage;