import { useState } from "react";
import LogDuelPageHeader from "../../components/LogDuelPageHeader/LogDuelPageHeader";
import ViewLogsPageControls from "./ViewLogsPageControls";
import classes from "./ViewLogsPages.module.css";

function ViewLogsPage() {

    const [toggle, setToggle] = useState<"user" | "opponent">("user");

    const myLogs = [
        {
            id: 1,
            date: "14 ноября, 20:54",
            text: "Сегодня потренировался, сделал 30 ударов.",
            photo: "https://s1.coincarp.com/logo/1/niggachain-ai-layer-2.png?style=200&v=1733795871"
        },
        {
            id: 2,
            date: "15 ноября, 18:10",
            text: "Пробежал 3 км, работал над техникой.",
            photo: "https://i1.sndcdn.com/avatars-zaCUjzWzmpQ5cqzn-4EqdxQ-t1080x1080.jpg"
        },
        {
            id: 4,
            date: "16 ноября, 18:10",
            text: "Пробежал 4 км, работал над техникой.",
            photo: "https://external-preview.redd.it/charlie-klank-vs-georgedroid-who-wins-v0-aTBmMTF3djduYnBmMePLD68yifbZHhiJBwfp89J4Q-Vy2a0Xcg4wyRudAFR0.png?format=pjpg&auto=webp&s=7d9f113cd4a134761cf9f96843006d7a97e4bad6"
        },
        {
            id: 3,
            date: "15 ноября, 18:10",
            text: "Пробежал 3 км, работал над техникой.",
            photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgJ1n6u4ODpLiu54hmviWJvRXsB_k4AmGEgQ&s"
        }
    ];

    const opponentLogs = [
        {
            id: 3,
            date: "14 ноября, 22:31",
            text: "Тренировка на выносливость + 20 приседаний.",
            photo: "https://placekitten.com/303/303"
        },
        {
            id: 4,
            date: "16 ноября, 19:47",
            text: "Играл с друзьями 40 минут, много бегал.",
            photo: "https://placekitten.com/304/304"
        }
    ];

    const logsToShow = (toggle === "user" ? myLogs : opponentLogs)
        .slice()
        .sort((a, b) => b.id - a.id);

    return (
        <>
            <LogDuelPageHeader habitName="Soccer" />

            <ViewLogsPageControls
                toggle={toggle}
                setToggle={setToggle}
                userCount={myLogs.length}
                opponentCount={opponentLogs.length}
            />

            <div className={classes.container}>
                {logsToShow.map(log => (
                    <div key={log.id} className={classes.logCard}>
                        <img src={log.photo} className={classes.photo} alt="" />
                        <div className={classes.logContent}>
                            <p className={classes.date}>{log.date}</p>
                            <p className={classes.text}>{log.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default ViewLogsPage;