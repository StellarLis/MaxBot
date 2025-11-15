import classes from "./ViewLogsPage.module.css";
import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";

interface ViewLogsPageHeaderProps {
    habitName: string;
}

function ViewLogsPageHeader( { habitName }: ViewLogsPageHeaderProps) {


    return (
        <header className={ classes.header } >
            <Link
                className={ classes.backLink }
                to={ '/' }
            >
                <ChevronLeft />
            </Link>
            <h1 className={ classes.headerText }>Посмотреть прогресс</h1>
            <p className={ classes.habitName }>{ habitName }</p>
        </header>
    );
}

export default ViewLogsPageHeader;