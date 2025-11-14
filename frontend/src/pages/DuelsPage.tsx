import DuelsPageHeader from "../components/DuelsPageHeader/DuelsPageHeader.tsx";
import DuelsPageControls from "../components/DuelsPageControls/DuelsPageControls.tsx";
import { useEffect, useState } from "react";
import DuelsPageList from "../components/DuelsPageList/DuelsPageList.tsx";
import useFetch from "../hooks/useFetch.ts";
import type { Duel, UserInfo } from "../lib/types/types.ts";
import { LoaderCircle } from "lucide-react";

function DuelsPage() {
    const API_BASE = "http://localhost:8080";

    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [endedDuels, setEndedDuels] = useState<Duel[]>([]);
    const [toggleDuels, setToggleDuels] = useState<'active' | 'completed'>('active');
    const [activeCount, setActiveCount] = useState<number>(0);
    const [completedCount, setCompletedCount] = useState<number>(0);
    const [winsCount, setWinsCount] = useState<number>(0);
    const [winRate, setWinRate] = useState<number>(0);

    const { fetching: fetchUserInfo, isPending, error } = useFetch(async () => {
        const response = await fetch(`${API_BASE}/user/getUserInfo?max_id=MAXID_1&first_name=User%201&photo_url=https://static.wikia.nocookie.net/9ce54273-1acd-4741-a95e-2c901171c601`);
        const data: UserInfo = await response.json();
        const ended = data.duels_info.filter(duel => duel.status === 'ended');
        setUserInfo(data);
        setEndedDuels(ended);
        setActiveCount(data.streak);
        setCompletedCount(ended.length);
        setWinsCount(ended.filter(duel => duel.user1_completed > duel.user2_completed).length);
        if (!(ended.length === 0)) {
            setWinRate(ended.filter(duel => duel.user1_completed > duel.user2_completed).length / ended.length);
        }

    });
    useEffect(() => {
        fetchUserInfo();
    }, []);

    return (
        <>
            <DuelsPageHeader winsCount={ winsCount } activeDuels={ activeCount } winRate={ winRate } />
            <DuelsPageControls
                toggle={ toggleDuels }
                activeCount={ userInfo ? userInfo.duels_info.length - endedDuels.length : 0 }
                completedCount={ completedCount }
                setToggle={ setToggleDuels }
            />

            { isPending && <div className="loaderCircle"><LoaderCircle className="loaderIcon" /></div> }
            { error && <p style={{textAlign: "center"}}>{ error }</p>}
            <DuelsPageList
                duelList={ userInfo ? userInfo.duels_info : [] }
                duelStatus={ toggleDuels }
            />
        </>
    )
}

export default DuelsPage;