"use client";

import { ReactNode, useCallback, useRef, useState } from "react";
import { clsx } from "clsx";

interface FilterDropdownProps {
    bg: "light" | "emphasised";
    hiearchy?: "primary" | "ghost" | "advsearch";
    size: "xsmall" | "small" | "medium" | "large";
    isActive?: boolean;
    isMultiChoice?: boolean;
    label: string;
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
    onTrailingIconClick?: () => void;
    children: ReactNode;
}

export default function FilterDropdown({
    bg,
    hiearchy = "primary",
    size,
    isActive = false,
    isMultiChoice = false,
    label,
    leadingIcon,
    trailingIcon,
    onTrailingIconClick,
    children,
}: FilterDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const element = useRef<HTMLDetailsElement>(null);
    const handleToggle = (e: any) => {
        const openState = e.target.open;

        if (openState) {
            window.addEventListener("click", documentClickHandler);
        } else {
            window.removeEventListener("click", documentClickHandler);
        }

        setIsOpen(openState);
    };

    const dynamicClasses = clsx(
        hiearchy === "advsearch" &&
            "!bg-surface-static-secondary !text-grey !fill-grey rounded-md !border-surface-static-secondary hover:!bg-secondary hover:!border-secondary w-full",
        hiearchy === "primary" && bg === "light" && "border-surface-static-border",
        bg === "light" && "text-grey fill-grey hover:text-black hover:fill-black",
        bg === "light" &&
            isActive &&
            "text-surface-static-emphasised fill-surface-static-emphasised border-surface-static-emphasised hover:text-surface-static-emphasised hover:fill-surface-static-emphasised",
        bg === "emphasised" && "text-white fill-white",
        bg === "emphasised" && isActive && "border-white hover:border-white",
        hiearchy === "primary" && bg === "emphasised" && "border-primary-emphasised-disabled hover:border-white",
        hiearchy === "ghost" &&
            bg === "emphasised" &&
            "hover:bg-ghost-hover !border-transparent hover:border-transparent",
        size === "xsmall" && "p-1.5 caption !leading-none gap-1",
        size === "small" && "p-2.5 caption gap-1.5",
        size === "medium" && "px-3.5 py-3 body-2 gap-2",
        size === "large" && "px-5 py-3.5 body-2 gap-2",
    );

    const dynamicIconClasses = clsx(
        "transition-all duration-200",
        hiearchy === "advsearch" && "ml-auto",
        size === "xsmall" && "w-3 h-3",
        size === "small" && "w-4 h-4",
        size === "medium" && "w-5 h-5",
        size === "large" && "w-5 h-5",
        isOpen && "transform rotate-180",
    );

    const placeholder = <span className="w-0.5" aria-hidden />;

    const trailingClickHandler = () => {
        if (!onTrailingIconClick) {
            setIsOpen(!isOpen);
            return;
        }

        setIsOpen(false);
        onTrailingIconClick();
    };

    const documentClickHandler = useCallback(
        (e: any) => {
            const target = e.target;
            const isInsideDetails = target.closest("details") === element.current;
            const isOutsideDropdown = target.closest("ul") !== null && !isMultiChoice;
            if (isInsideDetails && !isOutsideDropdown) return;
            setIsOpen(false);
        },
        [isMultiChoice],
    );

    return (
        <details ref={element} className="relative" onToggle={handleToggle} open={isOpen}>
            <summary
                className={`inline-flex cursor-pointer items-center gap-2 shrink-0 rounded-4xl bg-transparent border select-none transition-all duration-200 ${dynamicClasses}`}
            >
                {leadingIcon ? <span className={dynamicIconClasses}>{leadingIcon}</span> : placeholder}
                <span className="whitespace-nowrap">{label}</span>
                {trailingIcon ? (
                    <button type="button" onClick={trailingClickHandler} className={dynamicIconClasses}>
                        {trailingIcon}
                    </button>
                ) : (
                    placeholder
                )}
            </summary>

            <ul className="absolute z-10 min-w-full w-max mt-4 rounded shadow-lg max-h-72 overflow-x-auto overscroll-contain">
                {children}
            </ul>
        </details>
    );
}
