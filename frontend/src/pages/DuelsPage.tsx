import DuelsPageHeader from "../components/DuelsPageHeader/DuelsPageHeader.tsx";
import DuelsPageControls from "../components/DuelsPageControls/DuelsPageControls.tsx";
import { useEffect, useState } from "react";
import DuelsPageList from "../components/DuelsPageList/DuelsPageList.tsx";
import useFetch from "../hooks/useFetch.ts";
import type { Duel, UserInfo } from "../lib/types/types.ts";

declare global {
    interface Window {
        WebApp?: any;
    }
}

function DuelsPage() {
    const API_BASE = "https://maxbot-withoutdocker.onrender.com";

    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [endedDuels, setEndedDuels] = useState<Duel[]>([]);
    const [toggleDuels, setToggleDuels] = useState<"active" | "completed">("active");

    const [activeCount, setActiveCount] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [winsCount, setWinsCount] = useState(0);
    const [winRate, setWinRate] = useState(0);

    const [maxId, setMaxId] = useState<string | null>(null);
    const [firstName, setFirstName] = useState<string | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    // === 1) Инициализация MAX Bridge ===
    useEffect(() => {
        if (!window.WebApp) {
            console.error("MAX WebApp Bridge не найден");
            return;
        }

        const WebApp = window.WebApp;
        WebApp.ready();

        const initData = WebApp.initDataUnsafe;
        console.log("MAX initData:", initData);

        if (!initData || !initData.user) {
            console.error("Нет initData.user");
            return;
        }

        setMaxId(initData.user.id);
        setFirstName(initData.user.first_name || "");
        setPhotoUrl(initData.user.photo_url || "");
    }, []);

    const { fetching: fetchUserInfo, isPending, error } = useFetch(async () => {
        if (!maxId) return;

        const url = `${API_BASE}/user/getUserInfo?max_id=${encodeURIComponent(
            maxId
        )}&first_name=${encodeURIComponent(
            firstName || ""
        )}&photo_url=${encodeURIComponent(photoUrl || "")}`;

        console.log("FETCH:", url);

        const response = await fetch(url);
        const data: UserInfo = await response.json();

        const ended = data.duels_info.filter((duel) => duel.status === "ended");

        setUserInfo(data);
        setEndedDuels(ended);
        setActiveCount(data.streak);
        setCompletedCount(ended.length);


        const wins = ended.filter(
            (duel) => duel.user1_completed > duel.user2_completed
        ).length;

        setWinsCount(wins);
        if (ended.length !== 0) {
            setWinRate(wins / ended.length);
        }
    });

    useEffect(() => {
        if (maxId) fetchUserInfo();
    }, [maxId]);

    return (
        <>
            <DuelsPageHeader
                winsCount={winsCount}
                activeDuels={activeCount}
                winRate={winRate}
            />

            <DuelsPageControls
                toggle={toggleDuels}
                activeCount={
                    userInfo ? userInfo.duels_info.length - endedDuels.length : 0
                }
                completedCount={completedCount}
                setToggle={setToggleDuels}
            />

            {isPending && <div className="loaderCircle"></div>}
            {error && <p style={{ textAlign: "center" }}>{error}</p>}

            <DuelsPageList
                duelList={userInfo ? userInfo.duels_info : []}
                duelStatus={toggleDuels}
            />
        </>
    );
}

export default DuelsPage;