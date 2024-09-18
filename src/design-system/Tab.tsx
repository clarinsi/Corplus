import { ReactNode } from "react";
import IndicatorIcon from "@/assets/icons/IndicatorIcon";
import { clsx } from "clsx";

interface TabProps {
    label: string;
    name: string;
    isActive?: boolean;
    icon?: ReactNode;
    onClick?: (name: string) => void;
    disabled?: boolean;
}

export default function Tab({ label, name, icon, isActive = false, onClick, disabled }: TabProps) {
    const buttonClasses = clsx(
        "bg-white px-4 group inline-flex select-none border-thin border-static-border",
        disabled && "pointer-events-none",
    );

    const coreClasses = clsx(
        "flex items-center gap-2 py-3 transition-all duration-200 border-b group-hover:border-interactive",
        isActive ? "border-interactive" : "border-transparent",
        disabled && "opacity-50",
    );

    const iconClasses = clsx(
        "w-4 h-4 transition-all duration-200 group-hover:fill-interactive",
        isActive ? "fill-black" : "fill-grey",
    );

    const labelClasses = clsx(
        "body-2-title transition-all duration-200 group-hover:text-black text-grey",
        isActive && "!text-black",
    );

    return (
        <button type="button" className={buttonClasses} onClick={() => onClick && onClick(name)} disabled={disabled}>
            <div className={coreClasses}>
                <span className={iconClasses}>{icon || <IndicatorIcon />}</span>
                <p className={labelClasses}>{label}</p>
            </div>
        </button>
    );
}
