import classes from "./DuelsPageHeader.module.css"
import DuelsPageHeaderStats from "./Stats/DuelsPageHeaderStats.tsx";

interface DuelsPageHeaderProps {
    winsCount: number;
    activeDuels: number;
    winRate: number;
}

function DuelsPageHeader( { winsCount, activeDuels, winRate }: DuelsPageHeaderProps) {

    return (
        <header className={ classes.header }>
            <div className={ classes.headerTitle }>
                <h1 className={ classes.headerText }>Мои Дуэли</h1>
                <button className={ classes.newButton }
                >
                    <span className={ classes.plus }>+</span>
                    Создать
                </button>
            </div>
            <DuelsPageHeaderStats activeDuels={ activeDuels } winsCount={ winsCount } winRate={ winRate } />
        </header>
    );
}

export default DuelsPageHeader;