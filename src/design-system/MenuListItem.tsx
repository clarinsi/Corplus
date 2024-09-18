import { ReactNode } from "react";
import { clsx } from "clsx";

interface MenuListItemProps {
    value: string;
    icon?: ReactNode;
    activeIcon?: ReactNode;
    isActive?: boolean;
    children: ReactNode;
    trailingIcon?: ReactNode;
    onTrailingIconClick?: (e: any, value: string) => void;
    onClick?: (name: string) => void;
}

export default function MenuListItem({
    value,
    icon,
    activeIcon,
    isActive,
    children,
    trailingIcon,
    onTrailingIconClick,
    onClick,
}: MenuListItemProps) {
    const clickHandler = () => {
        if (!onClick) return;
        onClick(value);
    };

    const trailingIconClickHandler = (e: any) => {
        if (!onTrailingIconClick) return;
        onTrailingIconClick(e, value);
    };

    const iconClasses = clsx("w-4 h-4 fill-grey shrink-0");
    const textClasses = clsx("body-2 text-grey text-left");

    return (
        <li className="bg-white first:rounded-t last:rounded-b transition-all duration-200 hover:bg-secondary flex justify-between items-center">
            <button className="px-4 py-3 flex gap-2 items-center" onClick={clickHandler} type="button">
                <span className={iconClasses}>{isActive ? activeIcon : icon}</span>
                <span className={textClasses}>{children}</span>
            </button>
            {trailingIcon && (
                <button className="p-2 pr-4 outline-none" onClick={trailingIconClickHandler}>
                    <span className={iconClasses}>{trailingIcon}</span>
                </button>
            )}
        </li>
    );
}
