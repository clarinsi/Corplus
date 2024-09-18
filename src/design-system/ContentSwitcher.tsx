"use client";

import { ReactNode } from "react";
import { clsx } from "clsx";

interface ContentSwitcherProps {
    position: "left" | "center" | "right";
    isActive: boolean;
    name: string;
    icon?: ReactNode;
    children?: ReactNode;
    onClick?: (name: string) => void;
}

export default function ContentSwitcher({ position, isActive, name, icon, children, onClick }: ContentSwitcherProps) {
    const dynamicClasses = clsx(
        position === "left" && "rounded-tl rounded-bl",
        position === "right" && "rounded-tr rounded-br",
        isActive && "bg-primary border-primary text-white fill-white",
        !isActive &&
            "bg-white text-grey border-static-border fill-grey hover:bg-secondary hover:fill-black hover:text-black",
    );

    const clickHandler = () => {
        onClick && onClick(name);
    };

    return (
        <button
            className={`inline-flex p-2 border transition-all duration-200 ${dynamicClasses}`}
            onClick={clickHandler}
        >
            {icon && <span className="w-4 h-4">{icon}</span>}
            {children && <span className="caption-emphasised px-1">{children}</span>}
        </button>
    );
}
