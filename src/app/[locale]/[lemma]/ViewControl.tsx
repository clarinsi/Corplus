"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AlignHorizontalCenterIcon from "@/assets/icons/AlignHorizontalCenterIcon";
import AlignLeftIcon from "@/assets/icons/AlignLeftIcon";
import CheckBoxIcon from "@/assets/icons/CheckBoxIcon";
import CheckedBoxIcon from "@/assets/icons/CheckedBoxIcon";
import CorrectErrorIcon from "@/assets/icons/CorrectErrorIcon";
import { ALIGN_LEFT, HIGHLIGHT_ERRORS, SHOW_CORRECT, SHOW_ORIG } from "@/constants";
import ContentSwitcher from "@/design-system/ContentSwitcher";
import IconButton from "@/design-system/button/IconButton";
import TextButton from "@/design-system/button/TextButton";
import { parseSearchParams } from "@/util/parsing.util";
import { createUrl } from "@/util/util";

export default function ViewControl() {
    const t = useTranslations("ViewControl");
    const router = useRouter();
    const pathName = usePathname();
    const searchParams = useSearchParams();
    const parsedSearchParams = useMemo(() => parseSearchParams(searchParams), [searchParams]);
    const isSourceChecked = useMemo(() => parsedSearchParams.showOrig, [parsedSearchParams]);
    const isCorrectChecked = useMemo(() => parsedSearchParams.showCorrect, [parsedSearchParams]);
    const isHighlightErrorsChecked = useMemo(() => parsedSearchParams.highlightErrors, [parsedSearchParams]);
    const isLeftAligned = useMemo(() => parsedSearchParams.leftAlign, [parsedSearchParams]);
    const searchSource = useMemo(() => parsedSearchParams.searchSource, [parsedSearchParams]);

    const handleSourceClick = () => {
        const newParams = new URLSearchParams(searchParams);
        if (newParams.get(SHOW_ORIG) == "true") newParams.delete(SHOW_ORIG);
        else newParams.set(SHOW_ORIG, "true");
        router.replace(createUrl(pathName, newParams), { scroll: false });
    };

    const handleCorrectedClick = () => {
        const newParams = new URLSearchParams(searchParams);
        if (newParams.get(SHOW_CORRECT) == "true") newParams.delete(SHOW_CORRECT);
        else newParams.set(SHOW_CORRECT, "true");
        router.replace(createUrl(pathName, newParams), { scroll: false });
    };

    const handleHighlightErrorsClick = () => {
        const newParams = new URLSearchParams(searchParams);
        if (!parsedSearchParams.highlightErrors) newParams.delete(HIGHLIGHT_ERRORS);
        else newParams.set(HIGHLIGHT_ERRORS, "false");
        router.replace(createUrl(pathName, newParams), { scroll: false });
    };

    const handleLeftAlignClick = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set(ALIGN_LEFT, "true");
        router.replace(createUrl(pathName, newParams), { scroll: false });
    };

    const handleCenterAlignClick = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete(ALIGN_LEFT);
        router.replace(createUrl(pathName, newParams), { scroll: false });
    };

    return (
        <div className="flex">
            <div className="px-4 py-2">
                <ContentSwitcher
                    name="left"
                    position="left"
                    isActive={isLeftAligned}
                    icon={<AlignLeftIcon />}
                    onClick={handleLeftAlignClick}
                />
                <ContentSwitcher
                    name="right"
                    position="right"
                    isActive={!isLeftAligned}
                    icon={<AlignHorizontalCenterIcon />}
                    onClick={handleCenterAlignClick}
                />
            </div>

            <div className="flex gap-1 items-center px-4 py-2 border-l border-r border-static-border">
                <TextButton
                    bg="light"
                    hiearchy={isSourceChecked ? "primary" : "secondary"}
                    size="small"
                    trailingIcon={isSourceChecked ? <CheckedBoxIcon /> : <CheckBoxIcon />}
                    onClick={handleSourceClick}
                    disabled={searchSource === "ORIG"}
                >
                    {t("orig")}
                </TextButton>

                <TextButton
                    bg="light"
                    hiearchy={isCorrectChecked ? "primary" : "secondary"}
                    size="small"
                    trailingIcon={isCorrectChecked ? <CheckedBoxIcon /> : <CheckBoxIcon />}
                    onClick={handleCorrectedClick}
                    disabled={searchSource === "CORR"}
                >
                    {t("corr")}
                </TextButton>
            </div>

            <div className="flex items-center px-4">
                <IconButton
                    bg="light"
                    shape="square"
                    hiearchy={isHighlightErrorsChecked ? "primary" : "secondary"}
                    size="xsmall"
                    onClick={handleHighlightErrorsClick}
                >
                    <CorrectErrorIcon />
                </IconButton>
            </div>
        </div>
    );
}
