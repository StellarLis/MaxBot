import { useParams } from "react-router";
import { useEffect, useState } from "react";
import LogDuelPageHeader from "../../components/LogDuelPageHeader/LogDuelPageHeader";
import ViewLogsPageControls from "./ViewLogsPageControls";
import classes from "./ViewLogsPage.module.css";
import useFetch from "../../hooks/useFetch";
import type { Log } from "../../lib/types/types";
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
    const [habitName, setHabitName] = useState("Привычка");
    const [toggle, setToggle] = useState<"user" | "opponent">("user");
    const [logs, setLogs] = useState<Log[]>([]);

    const numericId = maxId ? Number(maxId) : null;

    useEffect(() => {
        if (!window.WebApp) return;

        window.WebApp.ready();
        const d = window.WebApp.initDataUnsafe;

        if (d?.user?.id) setMaxId(String(d.user.id));
        if (d?.start_param_habit) setHabitName(d.start_param_habit);
    }, []);

    const { fetching: fetchLogs, isPending: isLogsPending } = useFetch(async () => {
        if (!numericId || !duelID) return;

        const url = `${API_BASE}/duel/getDuelLogs?id=${encodeURIComponent(duelID)}`;
        console.log("REQUEST:", url);

        const response = await fetch(url);

        // Если сервер вернул неверный формат — fallback на []
        let data: any = [];
        try {
            data = await response.json();
            console.log("LOGS RESPONSE:", data);
        } catch (e) {
            console.error("JSON parse error:", e);
        }

        if (!Array.isArray(data)) {
            console.warn("Backend did not return array. Falling back to empty list.");
            setLogs([]);
            return;
        }

        setLogs(data);
    });

    useEffect(() => {
        if (numericId) fetchLogs();
    }, [numericId]);

    const isMyLog = (log: Log) =>
        numericId !== null && String(log.owner_id) === String(numericId);

    const isOppLog = (log: Log) =>
        numericId !== null && String(log.owner_id) !== String(numericId);

    return (
        <>
            <LogDuelPageHeader habitName={habitName} />

            <ViewLogsPageControls
                toggle={toggle}
                setToggle={setToggle}
                userCount={logs.filter(isMyLog).length}
                opponentCount={logs.filter(isOppLog).length}
            />

            {isLogsPending && (
                <div className="loaderCircle">
                    <LoaderCircle className="loaderIcon" />
                </div>
            )}

            <div className={classes.container}>
                {(toggle === "user" ? logs.filter(isMyLog) : logs.filter(isOppLog)).map(
                    (log) => (
                        <div key={log.log_id} className={classes.logCard}>
                            {log.photo && log.photo !== "" && (
                                <img
                                    src={`data:image/jpeg;base64,${log.photo}`}
                                    className={classes.photo}
                                    alt=""
                                />
                            )}
                            <div className={classes.logContent}>
                                <p className={classes.date}>{log.created_at || ""}</p>
                                <p className={classes.text}>{log.message || ""}</p>
                            </div>
                        </div>
                    )
                )}
            </div>
        </>
    );
}

export default ViewLogsPage;