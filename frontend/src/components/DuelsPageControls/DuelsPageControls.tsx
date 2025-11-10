import classes from "./DuelsPageControls.module.css";

interface DuelsPageControlsProps {
    toggle: 'active' | 'completed';
    setToggle: (value: 'active' | 'completed') => void;
    activeCount: number;
    completedCount: number;
}

function DuelsPageControls( { toggle, activeCount, completedCount, setToggle }: DuelsPageControlsProps ) {

    return (
        <div className={ classes.controlsContainer }>
            <button
                className={ classes.toggleButton }
                style={ toggle === 'active'
                    ? {backgroundColor: "#f2ddff"}
                    : {backgroundColor: "transparent"}
                }
                onClick={() => setToggle('active')}
            >
                Активные ({ activeCount })
            </button>
            <button
                className={ classes.toggleButton }
                style={ toggle !== 'active'
                    ? {backgroundColor: "#edd6ff"}
                    : {backgroundColor: "transparent"}
                }
                onClick={() => setToggle('completed')}
            >
                Завершённые ({ completedCount })
            </button>
        </div>
    );
}

export default DuelsPageControls;