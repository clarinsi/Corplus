"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import CloseIcon from "@/assets/icons/CloseIcon";
import SearchMenuRow from "@/design-system/SearchMenuRow";
import { SearchHistoryItem } from "@/types/search.types";

export default function SearchHistory() {
    const t = useTranslations("Search.history");
    const [historyItems, setHistoryItems] = useState<SearchHistoryItem[]>([]);

    const handleDelete = (e: any, index: number) => {
        e.preventDefault();
        e.stopPropagation();

        historyItems.splice(index, 1);
        setHistoryItems([...historyItems]);
        localStorage.setItem("history", JSON.stringify(historyItems));
    };

    useEffect(() => {
        setHistoryItems(JSON.parse(localStorage.getItem("history") ?? "[]"));
    }, []);

    if (historyItems.length === 0) {
        return (
            <>
                <SearchMenuRow type="header" title={t("title")} />
                <SearchMenuRow type="body" autocomplete="Ni zadetkov" />
                <SearchMenuRow type="body" />
                <SearchMenuRow type="body" />
                <SearchMenuRow type="body" />
            </>
        );
    }

    return (
        <>
            <SearchMenuRow type="header" title={t("title")} />
            {historyItems.map(({ keyword, url }, index) => (
                <SearchMenuRow
                    key={index}
                    type="body"
                    searchEntry={decodeURIComponent(keyword)}
                    url={url}
                    trailingIcon={<CloseIcon />}
                    trailingIconAction={(e) => handleDelete(e, index)}
                />
            ))}
            {historyItems.length - 5 < 0 &&
                new Array(5 - historyItems.length).fill(0).map((_, index) => <SearchMenuRow key={index} type="body" />)}
        </>
    );
}
