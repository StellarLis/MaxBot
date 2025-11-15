import { useEffect, useState } from "react";
import LogDuelPageHeader from "../../components/LogDuelPageHeader/LogDuelPageHeader";
import ViewLogsPageControls from "./ViewLogsPageControls";
import classes from "./ViewLogsPage.module.css";
import useFetch from "../../hooks/useFetch";
import type { Log, UserInfo } from "../../lib/types/types";
import { LoaderCircle } from "lucide-react";

declare global {
    interface Window {
        WebApp?: any;
    }
}

function ViewLogsPage() {
    const API_BASE = "https://maxbot-withoutdocker.onrender.com";

    const [maxId, setMaxId] = useState<string | null>(null);
    const [realId, setRealId] = useState<number | null>(null);
    const [habitName, setHabitName] = useState("Привычка");
    const [toggle, setToggle] = useState<"user" | "opponent">("user");
    const [logs, setLogs] = useState<Log[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // 1. Инициализация MAX Bridge
    useEffect(() => {
        if (!window.WebApp) return;

        window.WebApp.ready();
        const d = window.WebApp.initDataUnsafe;

        console.log("MAX INIT:", d);

        if (d?.user?.id) setMaxId(String(d.user.id));
        if (d?.start_param_habit) setHabitName(d.start_param_habit);

        setIsInitialized(true); // ← Теперь можно работать
    }, []);

    // 2. Загружаем внутренний user.id
    const { fetching: fetchUserInfo } = useFetch(async () => {
        if (!isInitialized) return;     // ждём init
        if (!maxId) return;             // ждём maxId

        const url = `${API_BASE}/user/getUserInfo?max_id=${encodeURIComponent(maxId)}`;
        console.log("USER REQUEST:", url);

        const res = await fetch(url);
        const data: UserInfo = await res.json();

        console.log("USER INFO:", data);

        setRealId(data.id);
    });

    useEffect(() => {
        if (isInitialized && maxId) fetchUserInfo();
    }, [isInitialized, maxId]);

    // 3. Загружаем логи по realId
    const { fetching: fetchLogs, isPending: isLogsPending } = useFetch(async () => {
        if (!realId) return;

        const url = `${API_BASE}/duel/getDuelLogs?id=${realId}`;
        console.log("LOGS REQUEST:", url);

        const response = await fetch(url);
        let data = [];

        try {
            data = await response.json();
        } catch (e) {
            console.error("LOGS PARSE ERROR:", e);
        }

        console.log("LOGS RESPONSE:", data);

        setLogs(Array.isArray(data) ? data : []);
    });

    useEffect(() => {
        if (realId) fetchLogs();
    }, [realId]);

    const isMyLog = (log: Log) => realId !== null && log.owner_id === realId;
    const isOppLog = (log: Log) => realId !== null && log.owner_id !== realId;

    return (
        <>
            <LogDuelPageHeader habitName={habitName} />

            <ViewLogsPageControls
                toggle={toggle}
                setToggle={setToggle}
                userCount={logs.filter(isMyLog).length}
                opponentCount={logs.filter(isOppLog).length}
            />

            {isLogsPending &&
                <div className="loaderCircle">
                    <LoaderCircle className="loaderIcon" />
                </div>
            }

            <div className={classes.container}>
                {(toggle === "user" ? logs.filter(isMyLog) : logs.filter(isOppLog)).map((log) => (
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
                ))}
            </div>
        </>
    );
}

export default ViewLogsPage;