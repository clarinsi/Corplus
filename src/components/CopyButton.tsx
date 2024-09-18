"use client";

import { useState } from "react";
import CopyIcon from "@/assets/icons/CopyIcon";
import IconButton from "@/design-system/button/IconButton";
import { clsx } from "clsx";

interface CopyButtonProps {
    onClick?: () => void;
}

export default function CopyButton({ onClick }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const clickHandler = () => {
        setCopied(true);
        onClick?.();
    };

    const btnClasses = clsx(`w-full h-full transition-all duration-200 fill-grey`, copied && "fill-[#52B640]");

    return (
        <IconButton bg="light" shape="square" hiearchy="ghost" size="xsmall" onClick={clickHandler}>
            <span className={btnClasses}>
                <CopyIcon />
            </span>
        </IconButton>
    );
}
