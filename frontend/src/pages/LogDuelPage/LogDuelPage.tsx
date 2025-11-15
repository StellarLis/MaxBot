import { useParams } from "react-router";
import useFetch from "../../hooks/useFetch.ts";
import type { Duel, UserInfo } from "../../lib/types/types.ts";
import { Camera, CircleCheck, CircleX, LoaderCircle, Type } from "lucide-react";
import classes from "./LogDuelPage.module.css";
import { Dialog } from "radix-ui";
import { useEffect, useState } from "react";
import LogDuelPageHeader from "../../components/LogDuelPageHeader/LogDuelPageHeader.tsx";

// типизация MAX WebApp
declare global {
    interface Window {
        WebApp?: any;
    }
}

function LogDuelPage() {
    const API_BASE = "https://maxbot-withoutdocker.onrender.com";

    const [noteValue, setNoteValue] = useState<string>("");
    const [isNoteSaved, setIsNoteSaved] = useState<boolean>(false);
    const [isImageSaved, setIsImageSaved] = useState<boolean>(false);
    const [image, setImage] = useState<string | null>(null);
    const [duel, setDuel] = useState<Duel | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const [maxId, setMaxId] = useState<string | null>(null);
    const [firstName, setFirstName] = useState<string | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    const { duelID } = useParams();

    // --- Получение данных пользователя через MAX Bridge --- //
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
            console.error("Нет user в initData");
            return;
        }

        // данные MAX пользователя
        setMaxId(initData.user.id);
        setFirstName(initData.user.first_name || null);
        setPhotoUrl(initData.user.photo_url || null);
    }, []);

    const { fetching: fetchUserInfo, isPending, error } = useFetch(async () => {
        if (!maxId) return;

        const url = `${API_BASE}/user/getUserInfo?max_id=${encodeURIComponent(
            maxId
        )}&first_name=${encodeURIComponent(firstName || "")}&photo_url=${encodeURIComponent(
            photoUrl || ""
        )}`;

        console.log("FETCH:", url);

        const response = await fetch(url);
        const data: UserInfo = await response.json();

        const currentDuel = data.duels_info.find(
            (d) => d.id === Number(duelID)
        );
        setDuel(currentDuel || null);
    });

    useEffect(() => {
        if (maxId) {
            fetchUserInfo();
        }
    }, [maxId]);

    const handleFileSelect = (e: any) => {
        const file: File = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Пожалуйста, выберите изображение");
            return;
        }

        setImage(file.name);
        setFile(file);
    };

    const handleSubmit = () => {
        if (!noteValue && !file) {
            alert("Добавьте запись или фотографию");
            return;
        }

        console.log("Отправка записи:", {
            noteValue,
            imageFile: file,
        });
    };

    return (
        <>
            {isPending && (
                <div className="loaderCircle">
                    <LoaderCircle className="loaderIcon" />
                </div>
            )}

            {error && <h1>Error: {error}</h1>}

            {duel && (
                <>
                    <LogDuelPageHeader habitName={duel.habit_name} />

                    <main className={classes.mainContent}>
                        <h2 className={classes.mainContent__header}>
                            Как бы вы хотели зафиксировать прогресс?
                        </h2>

                        {/* === Добавить запись === */}
                        <Dialog.Root>
                            <Dialog.Trigger asChild>
                                <button className={classes.addButton}>
                                    <span className={classes.iconContainer}>
                                        <Type />
                                    </span>
                                    <p className={classes.buttonDesc}>
                                        <span className={classes.add}>Добавить запись</span>
                                        <span className={classes.addAddition}>
                                            Опишите свой опыт
                                        </span>
                                    </p>
                                    {noteValue.length !== 0 && isNoteSaved && (
                                        <span className={classes.hasSaved}>
                                            <CircleCheck />
                                        </span>
                                    )}
                                </button>
                            </Dialog.Trigger>

                            <Dialog.Portal>
                                <Dialog.Overlay
                                    className={classes.dialogOverlay}
                                    onClick={() => setNoteValue("")}
                                />
                                <Dialog.Content className={classes.dialogContent}>
                                    <Dialog.Title className={classes.dialogTitle}>
                                        Добавить запись
                                    </Dialog.Title>
                                    <Dialog.Description className={classes.dialogDesc}>
                                        Опишите ваш опыт
                                    </Dialog.Description>

                                    <p className={classes.symbolsCount}>
                                        {noteValue.length}/150
                                    </p>

                                    <textarea
                                        className={classes.textArea}
                                        placeholder="Введите запись (максимум 150 символов)"
                                        maxLength={150}
                                        value={noteValue}
                                        onChange={(e) => setNoteValue(e.target.value)}
                                    />

                                    <div className={classes.bottomContainer}>
                                        <Dialog.Close asChild>
                                            <button
                                                className={classes.saveButton}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsNoteSaved(true);
                                                }}
                                            >
                                                Сохранить
                                            </button>
                                        </Dialog.Close>
                                    </div>

                                    <Dialog.Close asChild>
                                        <button
                                            className={classes.closeButton}
                                            onClick={() => setNoteValue("")}
                                            aria-label="Close"
                                        >
                                            <CircleX />
                                        </button>
                                    </Dialog.Close>
                                </Dialog.Content>
                            </Dialog.Portal>
                        </Dialog.Root>

                        {/* === Загрузить фото === */}
                        <Dialog.Root>
                            <Dialog.Trigger asChild>
                                <button className={classes.addButton}>
                                    <span className={classes.iconContainer}>
                                        <Camera />
                                    </span>
                                    <p className={classes.buttonDesc}>
                                        <span className={classes.add}>Загрузить фотографию</span>
                                        <span className={classes.addAddition}>
                                            Поделитесь моментом
                                        </span>
                                    </p>
                                    {image && isImageSaved && (
                                        <span className={classes.hasSaved}>
                                            <CircleCheck />
                                        </span>
                                    )}
                                </button>
                            </Dialog.Trigger>

                            <Dialog.Portal>
                                <Dialog.Overlay
                                    className={classes.dialogOverlay}
                                    onClick={() => setImage(null)}
                                />

                                <Dialog.Content className={classes.dialogContent}>
                                    <Dialog.Title className={classes.dialogTitle}>
                                        Загрузить фотографию
                                    </Dialog.Title>
                                    <Dialog.Description className={classes.dialogDesc}>
                                        Поделитесь моментом
                                    </Dialog.Description>

                                    <label className={classes.fileInput}>
                                        <input type="file" onChange={handleFileSelect} />
                                        <span className={classes.fileInputButton}>
                                            Выберите файл
                                        </span>
                                        <span className={classes.fileInputText}>{image}</span>
                                    </label>

                                    <div className={classes.bottomContainer}>
                                        <Dialog.Close asChild>
                                            <button
                                                className={classes.saveButton}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsImageSaved(true);
                                                }}
                                            >
                                                Сохранить
                                            </button>
                                        </Dialog.Close>
                                    </div>

                                    <Dialog.Close asChild>
                                        <button
                                            className={classes.closeButton}
                                            onClick={() => setImage(null)}
                                            aria-label="Close"
                                        >
                                            <CircleX />
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
            )}
        </>
    );
}

export default LogDuelPage;