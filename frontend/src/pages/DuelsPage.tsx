import DuelsPageHeader from "../components/DuelsPageHeader/DuelsPageHeader.tsx";
import DuelsPageControls from "../components/DuelsPageControls/DuelsPageControls.tsx";
import { useEffect, useState } from "react";
import DuelsPageList from "../components/DuelsPageList/DuelsPageList.tsx";
import useFetch from "../hooks/useFetch.ts";
import type { Duel, Habit, UserInfo } from "../lib/types/types.ts";
import { LoaderCircle } from "lucide-react";

// типизация MAX Bridge
declare global {
    interface Window {
        WebApp?: any;
    }
}

function DuelsPage() {
    const API_BASE = "https://maxbot-withoutdocker.onrender.com";

    // MAX user data
    const [maxId, setMaxId] = useState<string | null>(null);
    const [firstName, setFirstName] = useState<string | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [endedDuels, setEndedDuels] = useState<Duel[]>([]);
    const [toggleDuels, setToggleDuels] = useState<'active' | 'completed'>('active');
    const [activeCount, setActiveCount] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [winsCount, setWinsCount] = useState(0);
    const [winRate, setWinRate] = useState(0);
    const [habits, setHabits] = useState<Habit[] | null>(null);
    const [duelsTrigger, setDuelsTrigger] = useState(false);
    const [habitTrigger, setHabitTrigger] = useState(false);


    useEffect(() => {
        if (!window.WebApp) {
            console.error("MAX Bridge not found");
            return;
        }

        const WebApp = window.WebApp;
        WebApp.ready();

        const data = WebApp.initDataUnsafe;
        console.log("MAX initData:", data);

        if (!data || !data.user) {
            console.error("No user in initData");
            return;
        }

        setMaxId(data.user.id);
        setFirstName(data.user.first_name || "");
        setPhotoUrl(data.user.photo_url || "");
    }, []);


    const {
        fetching: fetchUserInfo,
        isPending: isUserInfoPending,
        error: userInfoError
    } = useFetch(async () => {
        if (!maxId) return;

        const response = await fetch(
            `${API_BASE}/user/getUserInfo` +
            `?max_id=${encodeURIComponent(maxId)}` +
            `&first_name=${encodeURIComponent(firstName || "")}` +
            `&photo_url=${encodeURIComponent(photoUrl || "")}`
        );

        const data: UserInfo = await response.json();
        const ended = data.duels_info.filter(d => d.status === "ended");

        setUserInfo(data);
        setEndedDuels(ended);

        setActiveCount(data.streak);
        setCompletedCount(ended.length);

        const wins = ended.filter(
            d => d.user1_completed > d.user2_completed
        ).length;

        setWinsCount(wins);
        if (ended.length > 0) {
            setWinRate(wins / ended.length);
        }
    });

    useEffect(() => {
        if (maxId) fetchUserInfo();
    }, [maxId, duelsTrigger]);


    const { fetching: fetchInvite } = useFetch(async () => {
        if (!maxId) return;

        const startParam = window.WebApp?.initDataUnsafe?.start_param;
        if (!startParam) return;

        const response = await fetch(
            `${API_BASE}/duel/acceptInvitation` +
            `?max_id=${encodeURIComponent(maxId)}` +
            `&first_name=${encodeURIComponent(firstName || "")}` +
            `&photo_url=${encodeURIComponent(photoUrl || "")}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invitation_hash: startParam })
            }
        );

        if (response.ok) {
            setDuelsTrigger(prev => !prev);
        }
    });

    useEffect(() => {
        const startParam = window.WebApp?.initDataUnsafe?.start_param;
        if (startParam) fetchInvite();
    }, [maxId]);


    const { fetching: fetchHabits } = useFetch(async () => {
        if (!maxId) return;

        const response = await fetch(
            `${API_BASE}/habit/getUserHabits` +
            `?max_id=${encodeURIComponent(maxId)}` +
            `&first_name=${encodeURIComponent(firstName || "")}` +
            `&photo_url=${encodeURIComponent(photoUrl || "")}`
        );

        const data: Habit[] = await response.json();
        setHabits(data);
    });

    useEffect(() => {
        if (maxId) fetchHabits();
    }, [maxId, habitTrigger]);

    return (
        <>
            <DuelsPageHeader
                winsCount={winsCount}
                activeDuels={activeCount}
                winRate={winRate}
                habits={habits ?? []}
                setHabitTrigger={setHabitTrigger}
                setDuelsTrigger={setDuelsTrigger}
            />

            <DuelsPageControls
                toggle={toggleDuels}
                activeCount={userInfo ? userInfo.duels_info.length - endedDuels.length : 0}
                completedCount={completedCount}
                setToggle={setToggleDuels}
            />

            {isUserInfoPending && (
                <div className="loaderCircle">
                    <LoaderCircle className="loaderIcon" />
                </div>
            )}

            {userInfoError && (
                <p style={{ textAlign: "center" }}>{userInfoError}</p>
            )}

            <DuelsPageList
                duelList={userInfo ? userInfo.duels_info : []}
                duelStatus={toggleDuels}
            />
        </>
    );
}

export default DuelsPage;