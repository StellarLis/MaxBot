import type { ElementType } from "react";
import classes from "./StatCard.module.css";

interface StatCardProps {
    Icon: ElementType;
    title: string;
    value: number;
    colors: Record<string, string>;
}

function StatCard( { Icon, title, value, colors }: StatCardProps ) {


    return (
        <div
            style={{backgroundColor: `${colors.iconColor}26`, border: `1px solid ${colors.iconColor}80`}}
            className={ classes.cardContainer }
        >
            <h2 className={ classes.header }>
                <Icon style={{color: colors.iconColor}} className={ classes.header__icon } />
                <span style={{color: colors.textColor}} className={ classes.header__text }>{ title }</span>
            </h2>
            <p style={{color: colors.textColor}} className={ classes.statCount }>{ value }</p>
        </div>
    );
}

export default StatCard;