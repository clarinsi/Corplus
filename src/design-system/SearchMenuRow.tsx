import { ReactNode } from "react";
import Link from "next/link";
import IconButton from "@/design-system/button/IconButton";
import { clsx } from "clsx";

interface SearchMenuRowProps {
    type: "body" | "link" | "header";
    title?: string;
    searchEntry?: string;
    autocomplete?: string;
    subtitle?: string;
    trailingIcon?: ReactNode;
    trailingIconAction?: (e: any) => void;
    url?: string;
}

export default function SearchMenuRow({
    type,
    title,
    subtitle,
    searchEntry,
    autocomplete,
    trailingIcon,
    trailingIconAction,
    url,
}: SearchMenuRowProps) {
    if (url) {
        return (
            <Link href={url}>
                <SearchMenuRowContent
                    type={type}
                    title={title}
                    subtitle={subtitle}
                    searchEntry={searchEntry}
                    autocomplete={autocomplete}
                    trailingIcon={trailingIcon}
                    trailingIconAction={trailingIconAction}
                    url={url}
                />
            </Link>
        );
    }

    return (
        <SearchMenuRowContent
            type={type}
            title={title}
            subtitle={subtitle}
            searchEntry={searchEntry}
            autocomplete={autocomplete}
            trailingIcon={trailingIcon}
            trailingIconAction={trailingIconAction}
        />
    );
}

const SearchMenuRowContent = ({
    type,
    title,
    subtitle,
    searchEntry,
    autocomplete,
    trailingIcon,
    trailingIconAction,
}: SearchMenuRowProps) => {
    const wrapperClasses = clsx(
        "bg-white flex justify-between items-center px-4 h-12 transition-all duration-200",
        type === "body" && searchEntry !== undefined && "hover:bg-secondary",
    );

    return (
        <div className={wrapperClasses}>
            {type === "header" && <h3 className="body-2-title">{title}</h3>}

            {type === "body" && (
                <div>
                    <p className="text-grey body-1">
                        {searchEntry}
                        <span className="text-light-grey">{autocomplete}</span>
                    </p>
                    {subtitle && <p className="text-light-grey caption">{subtitle}</p>}
                </div>
            )}

            {trailingIcon && (
                <IconButton bg="light" shape="round" hiearchy="ghost" size="xsmall" onClick={trailingIconAction}>
                    {trailingIcon}
                </IconButton>
            )}
        </div>
    );
};
