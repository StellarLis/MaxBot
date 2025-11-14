import { useParams } from "react-router";
import useFetch from "../../hooks/useFetch.ts";
import type { Duel, UserInfo } from "../../lib/types/types.ts";
import { Camera, CircleCheck, CircleX, LoaderCircle, Type } from "lucide-react";
import classes from "./LogDuelPage.module.css";
import { Dialog } from "radix-ui";
import { useEffect, useState } from "react";
import LogDuelPageHeader from "../../components/LogDuelPageHeader/LogDuelPageHeader.tsx";

function LogDuelPage() {
    const API_BASE = "http://localhost:8080"

    const [noteValue, setNoteValue] = useState<string>("");
    const [isNoteSaved, setIsNoteSaved] = useState<boolean>(false);
    const [isImageSaved, setIsImageSaved] = useState<boolean>(false);
    const [image, setImage] = useState<string | null>(null);
    const [duel, setDuel] = useState<Duel | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const { duelID } = useParams();
    const { fetching: fetchUserInfo, isPending, error } = useFetch(async () => {
        const response = await fetch(`${API_BASE}/user/getUserInfo?max_id=MAXID_1&first_name=User%201&photo_url=https://static.wikia.nocookie.net/9ce54273-1acd-4741-a95e-2c901171c601`);
        const data: UserInfo = await response.json();
        setDuel(data.duels_info.filter(duel => duel.id === Number(duelID))[0]);
    });

    const handleFileSelect = (e) => {
        const file: File = e.target.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert("Пожайлуйста, выберите изображение");
            return;
        }

        setImage(file.name);
        setFile(file);
    }

    const handleSubmit = () => {
        if (noteValue === null) {
            return;
        }

    }

    useEffect(() => {
        fetchUserInfo();
    }, []);

    return (
        <>
            { isPending && <div className="loaderCircle"><LoaderCircle className="loaderIcon" /></div> }
            { error && <h1>Error: { error }</h1> }
            { duel !== null &&
                <>
                    <LogDuelPageHeader habitName={ duel.habit_name } />
                    <main className={ classes.mainContent }>
                        <h2 className={ classes.mainContent__header }>
                            Как бы вы хотели зафиксировать прогресс?
                        </h2>
                        <Dialog.Root>
                            <Dialog.Trigger asChild>
                                <button className={ classes.addButton }>
                                    <span className={ classes.iconContainer }><Type /></span>
                                    <p className={ classes.buttonDesc }>
                                        <span className={ classes.add }>Добавить запись</span>
                                        <span className={ classes.addAddition }>Опишите свой опыт</span>
                                    </p>
                                    { noteValue.length !== 0 && isNoteSaved && <span className={ classes.hasSaved }><CircleCheck /></span> }
                                </button>
                            </Dialog.Trigger>
                            <Dialog.Portal>
                                <Dialog.Overlay
                                    className={ classes.dialogOverlay }
                                    onClick={() => setNoteValue("")}
                                />
                                <Dialog.Content className={ classes.dialogContent }>
                                    <Dialog.Title className={ classes.dialogTitle }>Добавить запись</Dialog.Title>
                                    <Dialog.Description className={ classes.dialogDesc }>Опишите ваш опыт</Dialog.Description>
                                    <p className={ classes.symbolsCount }>{ noteValue.length }/150</p>
                                    <textarea
                                        className={ classes.textArea }
                                        placeholder="Введите вашу запись (максимум 150 символов)"
                                        maxLength={150}
                                        value={ noteValue }
                                        onChange={ (e) => setNoteValue(e.target.value) }
                                    >
                                    </textarea>
                                    <div className={ classes.bottomContainer }>
                                        <Dialog.Close asChild>
                                            <button
                                                className={ classes.saveButton }
                                                onClick={e => {
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
                                            className={ classes.closeButton }
                                            onClick={() => setNoteValue("")}
                                            aria-label="Close"
                                        >
                                            <CircleX />
                                        </button>
                                    </Dialog.Close>
                                </Dialog.Content>
                            </Dialog.Portal>
                        </Dialog.Root>

                        <Dialog.Root>
                            <Dialog.Trigger asChild>
                                <button className={ classes.addButton }>
                                    <span className={ classes.iconContainer }><Camera /></span>
                                    <p className={ classes.buttonDesc }>
                                        <span className={ classes.add }>Загрузить фотографию</span>
                                        <span className={ classes.addAddition }>Поделитесь моментом</span>
                                    </p>
                                    { image && isImageSaved && <span className={ classes.hasSaved }><CircleCheck /></span> }
                                </button>
                            </Dialog.Trigger>
                            <Dialog.Portal>
                                <Dialog.Overlay
                                    className={ classes.dialogOverlay }
                                    onClick={() => setImage(null)}
                                />
                                <Dialog.Content className={ classes.dialogContent }>
                                    <Dialog.Title className={ classes.dialogTitle }>Загрузить фотографию</Dialog.Title>
                                    <Dialog.Description className={ classes.dialogDesc }>Поделитесь моментом</Dialog.Description>
                                    <label className={ classes.fileInput }>
                                        <input
                                            type="file"
                                            onChange={ handleFileSelect }
                                        />
                                        <span className={ classes.fileInputButton }>Выберите файл</span>
                                        <span className={ classes.fileInputText}>{ image }</span>
                                    </label>
                                    <div className={classes.bottomContainer }>
                                        <Dialog.Close asChild>
                                            <button
                                                className={ classes.saveButton }
                                                onClick={e => {
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
                                            className={ classes.closeButton }
                                            onClick={() => setImage(null)}
                                            aria-label="Close"
                                        >
                                            <CircleX />
                                        </button>
                                    </Dialog.Close>
                                </Dialog.Content>
                            </Dialog.Portal>
                        </Dialog.Root>
                        <button
                            className={ classes.submitButton }
                            onClick={ handleSubmit }
                        >Зафиксировать</button>
                    </main>
                </>
            }
        </>
    );
}

export default LogDuelPage;