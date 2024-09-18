import { ReactNode } from "react";
import { Link } from "@/navigation";
import { clsx } from "clsx";

interface FilledButtonProps {
    type?: "link" | "button";
    href?: string;
    bg: "light" | "emphasised";
    hiearchy: "primary" | "secondary" | "tertiary" | "ghost";
    size: "xsmall" | "small" | "medium" | "large";
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
    disabled?: boolean;
    children: ReactNode;
    onClick?: (...args: any[]) => void;
    isSubmit?: boolean;
}

export default function TextButton({
    type = "button",
    href,
    bg,
    hiearchy,
    size,
    leadingIcon,
    trailingIcon,
    disabled = false,
    children,
    onClick,
    isSubmit = false,
}: FilledButtonProps) {
    const dynamicClasses = clsx(
        size === "xsmall" && "p-1.5",
        size === "small" && "p-2.5 caption-emphasised gap-1.5",
        size === "medium" && "px-4 py-3.5 body-2-title gap-2",
        size === "large" && "px-5 py-3.5 body-2-title gap-2",
        hiearchy === "primary" &&
            "bg-primary text-white fill-white hover:bg-primary-hover disabled:text-light-grey disabled:fill-light-grey",
        hiearchy === "primary" && bg === "light" && "disabled:bg-primary-disabled",
        hiearchy === "primary" && bg === "emphasised" && "disabled:bg-primary-emphasised-disabled",

        hiearchy === "secondary" && "bg-transparent disabled:text-light-grey disabled:fill-light-grey",

        hiearchy === "secondary" &&
            bg === "light" &&
            "fill-grey text-grey !border-static-border hover:text-black hover:fill-black",
        hiearchy === "secondary" &&
            bg === "emphasised" &&
            "fill-white text-white !border-secondary-emphasised-border enabled:hover:border-white",
        hiearchy === "tertiary" && "disabled:text-light-grey disabled:fill-light-grey",

        hiearchy === "tertiary" &&
            bg === "light" &&
            "text-grey fill-grey bg-secondary hover:bg-secondary-hover disabled:bg-secondary-disabled",
        hiearchy === "tertiary" &&
            bg === "emphasised" &&
            "bg-tertiary-emphasised text-white fill-white hover:bg-tertiary-emphasised-hover disabled:bg-tertiary-emphasised-hover",
        hiearchy === "ghost" &&
            "bg-transparent hover:bg-ghost-hover disabled:bg-ghost-disabled disabled:text-light-grey disabled:fill-light-grey",
        hiearchy === "ghost" && bg === "light" && "text-black fill-black",
        hiearchy === "ghost" && bg === "emphasised" && "text-white fill-white",
    );

    const dynamicIconClasses = clsx(
        size === "small" && "w-4 h-4",
        size === "medium" && "w-5 h-5",
        size === "large" && "w-5 h-5",
    );

    if (type === "link") {
        return (
            <Link
                href={href!}
                className={`inline-flex items-center shrink-0 rounded-3xl border border-transparent transition-all duration-200 ${dynamicClasses}`}
            >
                {leadingIcon && <span className={dynamicIconClasses}>{leadingIcon}</span>}
                <span>{children}</span>
                {trailingIcon && <span className={dynamicIconClasses}>{trailingIcon}</span>}
            </Link>
        );
    }

    return (
        <button
            type={isSubmit ? "submit" : "button"}
            className={`inline-flex items-center shrink-0 rounded-3xl border border-transparent transition-all duration-200 ${dynamicClasses}`}
            disabled={disabled}
            onClick={onClick}
        >
            {leadingIcon && <span className={dynamicIconClasses}>{leadingIcon}</span>}
            <span>{children}</span>
            {trailingIcon && <span className={dynamicIconClasses}>{trailingIcon}</span>}
        </button>
    );
}
