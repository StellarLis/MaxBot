import {useNavigate, useParams} from "react-router";
import useFetch from "../../hooks/useFetch.ts";
import type { Duel, UserInfo } from "../../lib/types/types.ts";
import { Camera, CircleCheck, CircleX, LoaderCircle, Type } from "lucide-react";
import classes from "./LogDuelPage.module.css";
import { Dialog } from "radix-ui";
import { useEffect, useState } from "react";
import LogDuelPageHeader from "../../components/LogDuelPageHeader/LogDuelPageHeader.tsx";

declare global {
    interface Window { WebApp?: any; }
}

function LogDuelPage() {
    const API_BASE = "https://maxbot-withoutdocker.onrender.com";

    const [noteValue, setNoteValue] = useState("");
    const [isNoteSaved, setIsNoteSaved] = useState(false);
    const [isImageSaved, setIsImageSaved] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [duel, setDuel] = useState<Duel | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const [maxId, setMaxId] = useState<string | null>(null);
    const [firstName, setFirstName] = useState<string | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    const navigate = useNavigate();
    const { duelID } = useParams();

    useEffect(() => {
        if (!window.WebApp) return;
        window.WebApp.ready();
        const d = window.WebApp.initDataUnsafe;
        if (d?.user) {
            setMaxId(d.user.id);
            setFirstName(d.user.first_name || "");
            setPhotoUrl(d.user.photo_url || "");
        }
    }, []);

    const { fetching: fetchUserInfo, isPending, error } = useFetch(async () => {
        if (!maxId) return;
        const response = await fetch(
            `${API_BASE}/user/getUserInfo?max_id=${encodeURIComponent(maxId)}&first_name=${encodeURIComponent(firstName || "")}&photo_url=${encodeURIComponent(photoUrl || "")}`
        );
        const data: UserInfo = await response.json();
        setDuel(data.duels_info.filter(d => d.id === Number(duelID))[0]);
    });

    useEffect(() => {
        if (maxId) fetchUserInfo();
    }, [maxId]);

    const handleFileSelect = (e: any) => {
        const f: File = e.target.files[0];
        if (!f) return;
        if (!f.type.startsWith("image/")) return alert("Выберите изображение");
        setImage(f.name);
        setFile(f);
    };

    const fileToPureBase64 = (file: File) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async () => {
        if (!noteValue) return alert("Необходимо добавить запись");

        let imageBase64 = null;
        if (file) imageBase64 = await fileToPureBase64(file);

        const response = await fetch(
            `${API_BASE}/duel/contribute?max_id=${encodeURIComponent(maxId!)}&first_name=${encodeURIComponent(firstName!)}&photo_url=${encodeURIComponent(photoUrl!)}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    duel_id: Number(duelID),
                    message: noteValue,
                    photo: imageBase64
                })
            }
        );

        if (!response.ok) return alert("Ошибка загрузки");
        navigate("/");
    };

    return (
        <>
            {isPending && <div className="loaderCircle"><LoaderCircle className="loaderIcon"/></div>}
            {error && <h1>Error: {error}</h1>}

            {duel &&
                <>
                    <LogDuelPageHeader habitName={duel.habit_name}/>
                    <main className={classes.mainContent}>
                        <h2 className={classes.mainContent__header}>Как бы вы хотели зафиксировать прогресс?</h2>

                        <Dialog.Root>
                            <Dialog.Trigger asChild>
                                <button className={classes.addButton}>
                                    <span className={classes.iconContainer}><Type/></span>
                                    <p className={classes.buttonDesc}>
                                        <span className={classes.add}>Добавить запись</span>
                                        <span className={classes.addAddition}>Опишите свой опыт</span>
                                    </p>
                                    {noteValue.length !== 0 && isNoteSaved && <span className={classes.hasSaved}><CircleCheck/></span>}
                                </button>
                            </Dialog.Trigger>

                            <Dialog.Portal>
                                <Dialog.Overlay className={classes.dialogOverlay} onClick={() => setNoteValue("")}/>
                                <Dialog.Content className={classes.dialogContent}>
                                    <Dialog.Title className={classes.dialogTitle}>Добавить запись</Dialog.Title>
                                    <Dialog.Description className={classes.dialogDesc}>Опишите ваш опыт</Dialog.Description>

                                    <p className={classes.symbolsCount}>{noteValue.length}/150</p>

                                    <textarea
                                        className={classes.textArea}
                                        maxLength={150}
                                        value={noteValue}
                                        placeholder="Введите вашу запись"
                                        onChange={e => setNoteValue(e.target.value)}
                                    />

                                    <div className={classes.bottomContainer}>
                                        <Dialog.Close asChild>
                                            <button className={classes.saveButton} onClick={e => {
                                                e.stopPropagation();
                                                setIsNoteSaved(true);
                                            }}>
                                                Сохранить
                                            </button>
                                        </Dialog.Close>
                                    </div>

                                    <Dialog.Close asChild>
                                        <button className={classes.closeButton} onClick={() => setNoteValue("")}>
                                            <CircleX/>
                                        </button>
                                    </Dialog.Close>
                                </Dialog.Content>
                            </Dialog.Portal>
                        </Dialog.Root>

                        <Dialog.Root>
                            <Dialog.Trigger asChild>
                                <button className={classes.addButton}>
                                    <span className={classes.iconContainer}><Camera/></span>
                                    <p className={classes.buttonDesc}>
                                        <span className={classes.add}>Загрузить фотографию</span>
                                        <span className={classes.addAddition}>Поделитесь моментом</span>
                                    </p>
                                    {image && isImageSaved && <span className={classes.hasSaved}><CircleCheck/></span>}
                                </button>
                            </Dialog.Trigger>

                            <Dialog.Portal>
                                <Dialog.Overlay className={classes.dialogOverlay} onClick={() => setImage(null)}/>
                                <Dialog.Content className={classes.dialogContent}>
                                    <Dialog.Title className={classes.dialogTitle}>Загрузить фотографию</Dialog.Title>
                                    <Dialog.Description className={classes.dialogDesc}>Поделитесь моментом</Dialog.Description>

                                    <label className={classes.fileInput}>
                                        <input type="file" onChange={handleFileSelect}/>
                                        <span className={classes.fileInputButton}>Выберите файл</span>
                                        <span className={classes.fileInputText}>{image}</span>
                                    </label>

                                    <div className={classes.bottomContainer}>
                                        <Dialog.Close asChild>
                                            <button className={classes.saveButton} onClick={e => {
                                                e.stopPropagation();
                                                setIsImageSaved(true);
                                            }}>
                                                Сохранить
                                            </button>
                                        </Dialog.Close>
                                    </div>

                                    <Dialog.Close asChild>
                                        <button className={classes.closeButton} onClick={() => setImage(null)}>
                                            <CircleX/>
                                        </button>
                                    </Dialog.Close>
                                </Dialog.Content>
                            </Dialog.Portal>
                        </Dialog.Root>

                        <button className={classes.submitButton} onClick={handleSubmit}>
                            Зафиксировать
                        </button>
                    </main>
                </>
            }
        </>
    );
}

export default LogDuelPage;