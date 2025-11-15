import classes from "./DuelsPageHeader.module.css"
import DuelsPageHeaderStats from "./Stats/DuelsPageHeaderStats.tsx";
import { Dialog } from "radix-ui";
import { CircleX } from "lucide-react";
import type { Habit } from "../../lib/types/types.ts";
import { type Dispatch, type SetStateAction, useState } from "react";

interface DuelsPageHeaderProps {
    winsCount: number;
    activeDuels: number;
    winRate: number;

    habits: Habit[];
    setHabitTrigger: Dispatch<SetStateAction<boolean>>;
    setDuelsTrigger: Dispatch<SetStateAction<boolean>>;

    maxId: string;
    firstName: string;
    photoUrl: string;
}

function DuelsPageHeader({
    winsCount,
    activeDuels,
    winRate,
    habits,
    setHabitTrigger,
    setDuelsTrigger,
    maxId,
    firstName,
    photoUrl
}: DuelsPageHeaderProps) {
    const API_BASE = "https://maxbot-withoutdocker.onrender.com";

    const [habitCategory, setHabitCategory] = useState("");
    const [habitName, setHabitName] = useState("");
    const [duelDays, setDuelDays] = useState("30");
    const [habitId, setHabitId] = useState<number>(-1);
    const [invitationLink, setInvitationLink] = useState<{ invitation_link?: string }>({});


    const handleSubmitHabit = async (e: any) => {
        e.preventDefault();

        const response = await fetch(
            `${API_BASE}/habit/createNew?` +
            `max_id=${encodeURIComponent(maxId)}&` +
            `first_name=${encodeURIComponent(firstName)}&` +
            `photo_url=${encodeURIComponent(photoUrl)}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    habit_category: habitCategory,
                    habit_name: habitName
                })
            }
        );

        if (response.ok) {
            setHabitTrigger(prev => !prev);
        }

        setHabitCategory("");
        setHabitName("");
    };


    const handleSubmitDuel = async (e: any) => {
        e.preventDefault();

        if (habitId === -1) return;

        const response = await fetch(
            `${API_BASE}/duel/createNew?` +
            `max_id=${encodeURIComponent(maxId)}&` +
            `first_name=${encodeURIComponent(firstName)}&` +
            `photo_url=${encodeURIComponent(photoUrl)}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    days: Number(duelDays),
                    habit_id: habitId
                })
            }
        );

        if (response.ok) {
            const data = await response.json();
            setInvitationLink(data);
            setDuelsTrigger(prev => !prev);
        }

        setDuelDays("30");
    };

    return (
        <header className={classes.header}>
            <div className={classes.headerTitle}>
                <h1 className={classes.headerText}>Мои Дуэли</h1>

                <Dialog.Root>
                    <Dialog.Trigger asChild>
                        <button className={classes.newButton}>
                            <span className={classes.plus}>+</span>
                            Создать
                        </button>
                    </Dialog.Trigger>

                    <Dialog.Portal>
                        <Dialog.Overlay className={classes.dialogOverlay} />
                        <Dialog.Content className={classes.dialogContent}>
                            <Dialog.Title className={classes.dialogTitle}>
                                Создание новой дуэли
                            </Dialog.Title>
                            <Dialog.Description className={classes.dialogDesc}>
                                Создайте привычку, затем дуэль
                            </Dialog.Description>

                            {/* === ФОРМА СОЗДАНИЯ ПРИВЫЧКИ === */}
                            <form className={classes.habitForm} onSubmit={handleSubmitHabit}>
                                <label className={classes.label}>Название категории</label>
                                <input
                                    className={classes.input}
                                    value={habitCategory}
                                    onChange={e => setHabitCategory(e.target.value)}
                                    placeholder="Спорт, Здоровье..."
                                    maxLength={30}
                                />

                                <label className={classes.label}>Название привычки</label>
                                <input
                                    className={classes.input}
                                    value={habitName}
                                    onChange={e => setHabitName(e.target.value)}
                                    placeholder="Ваше название"
                                    maxLength={30}
                                />

                                <button type="submit" className={classes.submitButton}>
                                    Создать привычку
                                </button>
                            </form>

                            <form className={classes.duelForm} onSubmit={handleSubmitDuel}>
                                <label className={classes.label}>Цель</label>
                                <input
                                    type="number"
                                    min={1}
                                    className={classes.input}
                                    value={duelDays}
                                    onChange={e => setDuelDays(e.target.value)}
                                />

                                <label className={classes.label}>Привычка</label>
                                <select
                                    className={classes.habitSelect}
                                    onChange={e => setHabitId(Number(e.target.value))}
                                >
                                    <option disabled selected>Выберите привычку</option>
                                    {habits.map(h => (
                                        <option key={h.id} value={h.id}>
                                            {h.name}
                                        </option>
                                    ))}
                                </select>

                                <button type="submit" className={classes.submitButton}>
                                    Создать дуэль
                                </button>
                            </form>

                            <textarea
                                className={classes.invitationLink}
                                rows={4}
                                cols={20}
                                value={
                                    invitationLink.invitation_link
                                        ? `Пригласительная ссылка:\n${invitationLink.invitation_link}`
                                        : "Пригласительная ссылка:"
                                }
                                readOnly
                            ></textarea>

                            <Dialog.Close asChild>
                                <button className={classes.closeButton}>
                                    <CircleX />
                                </button>
                            </Dialog.Close>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>

            <DuelsPageHeaderStats
                activeDuels={activeDuels}
                winsCount={winsCount}
                winRate={winRate}
            />
        </header>
    );
}

export default DuelsPageHeader;