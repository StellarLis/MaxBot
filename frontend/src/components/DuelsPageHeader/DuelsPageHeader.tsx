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
    setDuelsTrigger: Dispatch<SetStateAction<boolean>>
}

function DuelsPageHeader( { winsCount, activeDuels, winRate, habits, setHabitTrigger, setDuelsTrigger }: DuelsPageHeaderProps) {
    const API_BASE = 'http://localhost:8080';

    const [habitCategory, setHabitCategory] = useState<string>("");
    const [habitName, setHabitName] = useState<string>("");
    const [duelDays, setDuelDays] = useState<string>("30");
    const [habitId, setHabitId] = useState<number>(-1);
    const [invitationLink, setInvitationLink] = useState<object>({});

    // @ts-ignore
    const handleSubmitHabit = async (e) => {
        e.preventDefault();

        const response = await fetch(`${API_BASE}/habit/createNew?max_id=MAXID_1&first_name=User%201&photo_url=someurl`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                habit_category: habitCategory,
                habit_name: habitName
            })
        });

        if (response.ok) {
            setHabitTrigger(prev => !prev);
        }

        setHabitCategory("");
        setHabitName("");
    }

    // @ts-ignore
    const handleSubmitDuel = async (e) => {
        e.preventDefault();

        if (habitId === -1) {
            return;
        }

        const response = await fetch(`${API_BASE}/duel/createNew?max_id=MAXID_1&first_name=User%201&photo_url=someurl`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                days: Number(duelDays),
                habit_id: habitId
            })
        });

        let invitationLink;
        if (response.ok) {
            invitationLink = await response.json();
            setInvitationLink(invitationLink);
            setDuelsTrigger(prev => !prev);
        }
        setDuelDays("30");
    }

    return (
        <header className={ classes.header }>
            <div className={ classes.headerTitle }>
                <h1 className={ classes.headerText }>Мои Дуэли</h1>
                <Dialog.Root>
                    <Dialog.Trigger asChild>
                        <button className={ classes.newButton }
                        >
                            <span className={ classes.plus }>+</span>
                            Создать
                        </button>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                        <Dialog.Overlay className={ classes.dialogOverlay }/>
                        <Dialog.Content className={ classes.dialogContent }>
                            <Dialog.Title className={ classes.dialogTitle }>Создание новой дуэли</Dialog.Title>
                            <Dialog.Description className={ classes.dialogDesc }>Создайте необходимые привычки, а затем и саму дуэль</Dialog.Description>

                            <form className={ classes.habitForm } onSubmit={ handleSubmitHabit }>
                                <label htmlFor="hbCategory" className={ classes.label }>Название категории</label>
                                <input
                                    id="hbCategory"
                                    className={ classes.input }
                                    type="text"
                                    maxLength={30}
                                    placeholder="Спорт, Здоровье, ..."
                                    value={ habitCategory }
                                    onChange={e => setHabitCategory(e.target.value)}
                                />
                                <label htmlFor="hbName" className={ classes.label }>Название привычки</label>
                                <input
                                    id="hbName"
                                    className={ classes.input }
                                    type="text"
                                    maxLength={30}
                                    placeholder="Ваше название"
                                    value={ habitName }
                                    onChange={e => setHabitName(e.target.value)}
                                />
                                <button type="submit" className={ classes.submitButton }>Создать привычку</button>
                            </form>

                            <form className={ classes.duelForm } onSubmit={ handleSubmitDuel }>
                                <label htmlFor="duelDays" className={ classes.label }>Цель</label>
                                <input
                                    id="duelDays"
                                    className={ classes.input }
                                    type="number"
                                    min={0}
                                    value={ duelDays }
                                    onChange={e => setDuelDays(e.target.value)}
                                />
                                <label htmlFor="duelHabit" className={ classes.label }>Привычка</label>
                                <select
                                    className={ classes.habitSelect }
                                    onChange={e => setHabitId(Number(e.target.value))}
                                >
                                    {habits.map(habit => (
                                        <option value={ habit.id } key={ habit.id }>{ habit.name }</option>
                                    ))}
                                </select>
                                <button type="submit" className={ classes.submitButton }>Создать дуэль</button>
                            </form>

                            <textarea
                                className={ classes.invitationLink }
                                rows={4}
                                cols={20}
                                // @ts-ignore
                                value={invitationLink.invitation_link ? `Пригласительная ссылка: ${invitationLink.invitation_link}` : "Пригласительная ссылка:"}
                            ></textarea>

                            <Dialog.Close asChild>
                                <button
                                    className={ classes.closeButton }
                                    aria-label="Close"
                                >
                                    <CircleX />
                                </button>
                            </Dialog.Close>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>
            <DuelsPageHeaderStats activeDuels={ activeDuels } winsCount={ winsCount } winRate={ winRate } />
        </header>
    );
}

export default DuelsPageHeader;