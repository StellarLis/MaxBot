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

    const [maxId, setMaxId] = useState<string | null>(null);         // MAX user.id
    const [realId, setRealId] = useState<number | null>(null);       // внутренний id
    const [habitName, setHabitName] = useState("Привычка");
    const [toggle, setToggle] = useState<"user" | "opponent">("user");
    const [logs, setLogs] = useState<Log[]>([]);

    // 1. Получаем MAX данные
    useEffect(() => {
        if (!window.WebApp) return;

        window.WebApp.ready();
        const d = window.WebApp.initDataUnsafe;

        if (d?.user?.id) setMaxId(String(d.user.id));
        if (d?.start_param_habit) setHabitName(d.start_param_habit);
    }, []);

    // 2. Получаем ВНУТРЕННИЙ id через user/getUserInfo
    const { fetching: fetchUser } = useFetch(async () => {
        if (!maxId) return;

        const res = await fetch(`${API_BASE}/user/getUserInfo?id=${maxId}`);
        const data: UserInfo = await res.json();

        console.log("USER_INFO:", data);

        setRealId(data.id); 
    });

    useEffect(() => {
        if (maxId) fetchUser();
    }, [maxId]);

    // 3. Запрашиваем логи по внутреннему id
    const { fetching: fetchLogs, isPending: isLogsPending } = useFetch(async () => {
        if (!realId) return;

        const url = `${API_BASE}/duel/getDuelLogs?id=${realId}`;
        console.log("REQUEST:", url);

        const response = await fetch(url);
        let data = [];

        try {
            data = await response.json();
            console.log("LOGS_RESPONSE:", data);
        } catch (err) {
            console.error("JSON parse error:", err);
        }

        if (Array.isArray(data)) setLogs(data);
        else setLogs([]);
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