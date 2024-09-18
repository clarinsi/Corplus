import React, { ReactNode } from "react";
import { clsx } from "clsx";

export default function AdvRow({ children, border = false }: { children: ReactNode; border?: boolean }) {
    const classes = clsx("px-4 pt-4 pb-5 flex gap-4 items-end", border && "border-b-thin border-static-border");

    return <div className={classes}>{children}</div>;
}
