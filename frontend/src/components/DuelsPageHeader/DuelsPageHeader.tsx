import classes from "./DuelsPageHeader.module.css"
import DuelsPageHeaderStats from "./Stats/DuelsPageHeaderStats.tsx";


function DuelsPageHeader() {

    return (
        <header className={ classes.header }>
            <div className={ classes.headerTitle }>
                <h1 className={ classes.headerText }>My Duels</h1>
                <button className={ classes.newButton }
                >
                    <span className={ classes.plus }>+</span>
                    New
                </button>
            </div>
            <DuelsPageHeaderStats />
        </header>
    );
}

export default DuelsPageHeader;