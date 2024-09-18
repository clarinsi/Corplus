"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import CloseIcon from "@/assets/icons/CloseIcon";
import InformationIcon from "@/assets/icons/InformationIcon";
import IconButton from "@/design-system/button/IconButton";

export default function StatisticsInfo() {
    const t = useTranslations("Filters.Statistics");
    const [isShowingInfo, setIsShowingInfo] = useState(false);

    return (
        <div className="px-4 py-2 relative">
            <IconButton
                bg="light"
                shape="square"
                hiearchy="secondary"
                size="xsmall"
                onClick={() => setIsShowingInfo(!isShowingInfo)}
            >
                <InformationIcon />
            </IconButton>

            {isShowingInfo && (
                <div className="text-sm text-center absolute bg-primary text-white top-12 left-6 w-screen max-w-xl p-4 shadow-lg rounded z-30">
                    <div className="flex justify-between items-center mb-3">
                        <h3>{t("title")}</h3>

                        <IconButton
                            bg="emphasised"
                            shape="square"
                            hiearchy="ghost"
                            size="xsmall"
                            onClick={() => setIsShowingInfo(false)}
                        >
                            <CloseIcon />
                        </IconButton>
                    </div>

                    <ul className="text-sm pl-4 flex text-left flex-col gap-3 list-disc">
                        <li>{t("option1")}</li>

                        <li>{t("option2")}</li>
                    </ul>
                </div>
            )}
        </div>
    );
}
