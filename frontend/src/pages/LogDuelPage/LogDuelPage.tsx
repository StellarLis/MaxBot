import { Link, useParams } from "react-router";
import useFetch from "../../hooks/useFetch.ts";
import type { Duel } from "../../lib/types/types.ts";
import { Camera, ChevronLeft, CircleCheck, CircleX, LoaderCircle, Type } from "lucide-react";
import classes from "./LogDuelPage.module.css";
import { Dialog } from "radix-ui";
import { useState } from "react";

function LogDuelPage() {
    const [noteValue, setNoteValue] = useState<string>("");
    const [isNoteSaved, setIsNoteSaved] = useState<boolean>(false);
    const [isImageSaved, setIsImageSaved] = useState<boolean>(false);
    const [image, setImage] = useState<string | null>(null);

    const { duelID } = useParams();
    const { data: duel, isPending, error } = useFetch<Duel>(`http://localhost:4000/duels/${duelID}`);

    const getImage = (fullPath: string | null): string => {
        if (fullPath === null) {
            return "";
        }

        let sliceIndex = 0;
        for (let i = fullPath.length - 1; i >= 0; i--) {
            if (fullPath[i] === "\\") {
                sliceIndex = i;
                break;
            }
        }

        return fullPath.slice(sliceIndex, fullPath.length);
    }

    const handleSubmit = () => {

    }

    return (
        <>
            { isPending && <LoaderCircle className={ classes.loader } /> }
            { error && <h1>Error: { error.message }</h1> }
            { duel !== null &&
                <>
                    <header className={ classes.header } >
                        <Link
                            className={ classes.backLink }
                            to={ '/' }
                        >
                            <ChevronLeft />
                        </Link>
                        <h1 className={ classes.headerText }>Зафиксировать прогресс</h1>
                        <p className={ classes.habitName }>{ duel.habitName }</p>
                    </header>
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
                                            onChange={(e) => setImage(e.target.value)}
                                        />
                                        <span className={ classes.fileInputButton }>Выберите файл</span>
                                        <span className={ classes.fileInputText}>{ getImage(image) }</span>
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