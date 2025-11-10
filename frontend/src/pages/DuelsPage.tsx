import DuelsPageHeader from "../components/DuelsPageHeader/DuelsPageHeader.tsx";
import DuelsPageControls from "../components/DuelsPageControls/DuelsPageControls.tsx";
import { useState } from "react";
import DuelsPageList from "../components/DuelsPageList/DuelsPageList.tsx";
import type { Duel } from "../lib/types/types.ts";

const mockDuels: Duel[] = [
    {
        id: "1",
        habitName: "Утренняя медитация",
        opponentName: "Иванов Иван",
        opponentAvatar: "avatarURL",
        userProgress: 18,
        opponentProgress: 15,
        targetDays: 30,
        currentDay: 18,
        startDate: "2025-10-20",
        endDate: "2025-11-19",
        status: "active",
        userStreak: 5,
        opponentStreak: 3,
        category: "Внимательность"
    },
    {
        id: "2",
        habitName: "Читать 30 минут",
        opponentName: "Михаил Петров",
        opponentAvatar: "avatarURL",
        userProgress: 12,
        opponentProgress: 14,
        targetDays: 21,
        currentDay: 14,
        startDate: "2025-10-23",
        endDate: "2025-11-13",
        status: "active",
        userStreak: 4,
        opponentStreak: 6,
        category: "Обучение"
    },
    {
        id: "3",
        habitName: "10K Шагов в день",
        opponentName: "Елена Кузнецова",
        opponentAvatar: "avatarURL",
        userProgress: 20,
        opponentProgress: 20,
        targetDays: 30,
        currentDay: 24,
        startDate: "2025-10-13",
        endDate: "2025-11-12",
        status: "active",
        userStreak: 8,
        opponentStreak: 7,
        category: "Фитнесс"
    },
    {
        id: "4",
        habitName: "Без социальных сетей",
        opponentName: "Александр Огурцов",
        opponentAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
        userProgress: 7,
        opponentProgress: 6,
        targetDays: 14,
        currentDay: 7,
        startDate: "2025-10-30",
        endDate: "2025-11-13",
        status: "active",
        userStreak: 7,
        opponentStreak: 6,
        category: "Цифровой Детокс"
    },
    {
        id: "5",
        habitName: "Утренние занятия",
        opponentName: "Алексей Марков",
        opponentAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
        userProgress: 30,
        opponentProgress: 25,
        targetDays: 30,
        currentDay: 30,
        startDate: "2025-10-01",
        endDate: "2025-10-31",
        status: "won",
        userStreak: 15,
        opponentStreak: 12,
        category: "Фитнесс"
    },
    {
        id: "6",
        habitName: "Выпить 8 стаканов воды",
        opponentName: "Lisa Wang",
        opponentAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
        userProgress: 18,
        opponentProgress: 21,
        targetDays: 21,
        currentDay: 21,
        startDate: "2025-10-10",
        endDate: "2025-10-31",
        status: "lost",
        userStreak: 8,
        opponentStreak: 12,
        category: "Здоровье"
    },
    {
        id: "7",
        habitName: "Вести ежедневник",
        opponentName: "Tom Brown",
        opponentAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
        userProgress: 14,
        opponentProgress: 14,
        targetDays: 14,
        currentDay: 14,
        startDate: "2025-10-15",
        endDate: "2025-10-29",
        status: "tied",
        userStreak: 10,
        opponentStreak: 10,
        category: "Внимательность"
    }
]

function DuelsPage() {
    const [toggleDuels, setToggleDuels] = useState<'active' | 'completed'>('active');
    const [activeCount, setActiveCount] = useState<number>(mockDuels.filter(duel => duel.status === 'active').length);
    const [completedCount, setCompletedCount] = useState<number>(mockDuels.filter(duel => duel.status !== 'active').length);
    const [winsCount, setWinsCount] = useState<number>(mockDuels.filter(duel => duel.status === 'won').length);
    const [winRate, setWinRate] = useState<number>((mockDuels.filter(duel => duel.status === 'won').length / mockDuels.filter(duel => (duel.status === 'lost' || duel.status === 'tied')).length) * 100);

    return (
        <>
            <DuelsPageHeader winsCount={ winsCount } activeDuels={ activeCount } winRate={ winRate } />
            <DuelsPageControls
                toggle={ toggleDuels }
                activeCount={ activeCount }
                completedCount={ completedCount }
                setToggle={ setToggleDuels }
            />
            <DuelsPageList
                duelList={ mockDuels }
                duelStatus={ toggleDuels }
            />
        </>
    )
}

export default DuelsPage;