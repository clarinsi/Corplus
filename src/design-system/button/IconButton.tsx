import { ReactNode } from "react";
import { clsx } from "clsx";

interface FilledButtonProps {
    type?: "link" | "button";
    shouldSubmit?: boolean;
    href?: string;
    bg: "light" | "emphasised";
    shape: "square" | "round";
    hiearchy: "primary" | "secondary" | "tertiary" | "ghost";
    size: "xsmall" | "small" | "medium" | "large";
    disabled?: boolean;
    children: ReactNode;
    onClick?: (e: any) => void;
}

export default function IconButton({
    type = "button",
    shouldSubmit = false,
    href,
    bg,
    hiearchy,
    shape,
    size,
    disabled = false,
    children,
    onClick,
}: FilledButtonProps) {
    const dynamicClasses = clsx(
        "flex border justify-center items-center w-fit h-fit shrink-0 transition-all duration-200",
        size === "xsmall" && "p-1.5",
        size === "small" && "p-2.5",
        size === "medium" && "p-4",
        size === "large" && "p-5",
        shape === "square" && "rounded",
        shape === "round" && "rounded-full",
        hiearchy === "primary" &&
            "bg-primary border-primary text-white fill-white hover:bg-primary-hover disabled:text-light-grey disabled:fill-light-grey",

        hiearchy === "primary" && bg === "light" && "disabled:bg-primary-disabled",
        hiearchy === "primary" &&
            bg === "emphasised" &&
            "disabled:bg-primary-emphasised-disabled disabled:border-primary-emphasised-disabled",

        hiearchy === "secondary" && "bg-transparent disabled:text-light-grey disabled:fill-light-grey",

        hiearchy === "secondary" &&
            bg === "light" &&
            "fill-grey text-grey border-static-border hover:text-black hover:fill-black",

        hiearchy === "secondary" &&
            bg === "emphasised" &&
            "fill-white text-white border-secondary-emphasised-border enabled:hover:border-white",

        hiearchy === "tertiary" && "disabled:text-light-grey disabled:fill-light-grey",

        hiearchy === "tertiary" &&
            bg === "light" &&
            "text-grey fill-grey bg-secondary hover:bg-secondary-hover disabled:bg-secondary-disabled",

        hiearchy === "tertiary" &&
            bg === "emphasised" &&
            "bg-tertiary-emphasised text-white fill-white hover:bg-tertiary-emphasised-hover disabled:bg-tertiary-emphasised-hover",

        hiearchy === "ghost" &&
            "bg-transparent border-transparent hover:bg-ghost-hover disabled:bg-ghost-disabled disabled:text-light-grey disabled:fill-light-grey",

        hiearchy === "ghost" && bg === "light" && "text-black fill-grey",
        hiearchy === "ghost" && bg === "emphasised" && "text-white fill-white",
    );

    const iconStyles = clsx("w-5 h-5 flex justify-center items-center caption");

    if (type === "link" && !disabled) {
        return (
            <a className={dynamicClasses} href={href}>
                <span className={iconStyles}>{children}</span>
            </a>
        );
    }

    return (
        <button
            type={shouldSubmit ? "submit" : "button"}
            className={dynamicClasses}
            disabled={disabled}
            onClick={onClick}
        >
            <span className={iconStyles}>{children}</span>
        </button>
    );
}
