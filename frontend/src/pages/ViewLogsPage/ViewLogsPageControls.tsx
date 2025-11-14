import classes from "./ViewLogsPages.module.css";

interface Props {
    toggle: 'user' | 'opponent';
    setToggle: (value: 'user' | 'opponent') => void;
    userCount: number;
    opponentCount: number;
}

const ViewLogsPageControls = ({ toggle, setToggle, userCount, opponentCount }: Props) => {
    return (
        <div className={classes.controlsContainer}>
            <button
                className={`${classes.toggleButton} ${toggle === 'user' ? classes.active : ""}`}
                onClick={() => setToggle('user')}
            >
                Твои ({userCount})
            </button>

            <button
                className={`${classes.toggleButton} ${toggle === 'opponent' ? classes.active : ""}`}
                onClick={() => setToggle('opponent')}
            >
                Противника ({opponentCount})
            </button>
        </div>
    );
};

export default ViewLogsPageControls;