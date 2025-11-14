import classes from "./LogDuelPageHeader.module.css";
import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";

interface LogDuelPageHeaderProps {
    habitName: string;
}

function LogDuelPageHeader( { habitName }: LogDuelPageHeaderProps) {


    return (
        <header className={ classes.header } >
            <Link
                className={ classes.backLink }
                to={ '/' }
            >
                <ChevronLeft />
            </Link>
            <h1 className={ classes.headerText }>Зафиксировать прогресс</h1>
            <p className={ classes.habitName }>{ habitName }</p>
        </header>
    );
}

export default LogDuelPageHeader;