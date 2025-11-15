import { useParams } from "react-router";
import { useEffect, useState } from "react";
import type { Duel, Log } from "../../lib/types/types.ts";
import ViewLogsPageHeader from "./ViewLogsPageHeader";
import ViewLogsPageControls from "./ViewLogsPageControls";
import classes from "./ViewLogsPage.module.css";
import useFetch from "../../hooks/useFetch.ts";
import { LoaderCircle } from "lucide-react";

declare global {
    interface Window {
        WebApp?: any;
    }
}

function ViewLogsPage() {
    const API_BASE = "https://maxbot-withoutdocker.onrender.com";
    const { duelID } = useParams<{ duelID: string }>();

    const [duel, setDuel] = useState<Duel | null>(null);
    const [maxId, setMaxId] = useState<string | null>(null);
    const [logs, setLogs] = useState<Log[]>([]);
    const [toggle, setToggle] = useState<"user" | "opponent">("user");

    useEffect(() => {
        if (!window.WebApp) return;

        window.WebApp.ready();
        const data = window.WebApp.initDataUnsafe;
        if (data?.user?.id) {
            setMaxId(String(data.user.id));
        }
    }, []);

    const { fetching: fetchDuel, isPending: isDuelPending } = useFetch(async () => {
        if (!maxId || !duelID) return;

        const response = await fetch(
            `${API_BASE}/user/getUserInfo?max_id=${encodeURIComponent(maxId)}`
        );

        if (!response.ok) throw new Error("Failed to fetch user info");

        const { duels_info }: { duels_info: Duel[] } = await response.json();
        const foundDuel = duels_info.find(d => d.id === Number(duelID));
        if (foundDuel) setDuel(foundDuel);
    });

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
        if (maxId && duelID) fetchDuel();
    }, [maxId, duelID]);

    useEffect(() => {
        if (duelID) fetchLogs();
    }, [duelID, maxId]);

    const userLogs = maxId ? logs.filter(l => l.max_id === maxId) : [];
    const opponentLogs = maxId ? logs.filter(l => l.max_id !== maxId) : [];

    const isLoading = isDuelPending || isLogsPending;

    return (
        <>
            {isLoading && (
                <div className="loaderCircle">
                    <LoaderCircle className="loaderIcon" />
                </div>
            )}

            {!isLoading && duel && (
                <>
                    <ViewLogsPageHeader habitName={duel.habit_name} />

                    <ViewLogsPageControls
                        toggle={toggle}
                        setToggle={setToggle}
                        userCount={userLogs.length}
                        opponentCount={opponentLogs.length}
                    />

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
                </>
            )}

            {/* Если duel не найдена — можно показать fallback */}
            {!isLoading && !duel && <p>Дуэль не найдена.</p>}
        </>
    );
}

export default ViewLogsPage;