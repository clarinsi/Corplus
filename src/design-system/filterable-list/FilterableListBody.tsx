import { ReactNode } from "react";
import { useFormatter } from "next-intl";
import CheckBoxIcon from "@/assets/icons/CheckBoxIcon";
import CheckedBoxIcon from "@/assets/icons/CheckedBoxIcon";
import { clsx } from "clsx";

interface FilterableListBodyProps {
    label: string;
    name: string;
    freq: number;
    isActive?: boolean;
    trailingIcon?: ReactNode;
    onTrailingIconClick?: () => void;
    onClick?: (name: string) => void;
    isDisabled?: boolean;
}

export default function FilterableListBody({
    label,
    name,
    freq,
    isActive,
    trailingIcon,
    onTrailingIconClick,
    onClick,
    isDisabled = false,
}: FilterableListBodyProps) {
    const formatter = useFormatter();

    const clickHandler = () => {
        if (!onClick) return;
        onClick(name);
    };

    const wrapperClasses = clsx(
        `px-4 flex justify-between items-center transition-all duration-200`,
        !isDisabled && "hover:bg-secondary",
    );
    const trailingClasses = clsx(`caption`, isDisabled ? `text-light-grey` : `text-grey`);

    return (
        <div className={wrapperClasses}>
            <button
                className="pr-4 py-1.5 w-full text-grey flex items-center justify-between disabled:text-light-grey disabled:fill-light-grey"
                onClick={clickHandler}
                disabled={isDisabled}
            >
                <div className="flex items-center gap-2">
                    <span className="w-4 h-4 shrink-0">
                        {isActive || isDisabled ? <CheckedBoxIcon /> : <CheckBoxIcon />}
                    </span>
                    <span className="callout text-left">{label}</span>
                </div>

                {freq !== -1 && (
                    <span className={trailingClasses}>{formatter.number(freq, { maximumFractionDigits: 2 })}</span>
                )}
            </button>

            {trailingIcon && (
                <button className="p-1 outline-none" onClick={onTrailingIconClick}>
                    <span className="w-4 h-4 shrink-0">{trailingIcon}</span>
                </button>
            )}
        </div>
    );
}
