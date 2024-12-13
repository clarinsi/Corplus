"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CloseIcon from "@/assets/icons/CloseIcon";
import ParagraphDetailsLoader from "@/components/loaders/ParagraphDetailsLoader";
import ParagraphCompareTab from "@/components/paragraph/ParagraphCompareTab";
import ParagraphCorrTab from "@/components/paragraph/ParagraphCorrTab";
import ParagraphError from "@/components/paragraph/ParagraphError";
import ParagraphMetadataTab from "@/components/paragraph/ParagraphMetadataTab";
import ParagraphSourceTab from "@/components/paragraph/ParagraphSourceTab";
import { EXPANDED_CONCORDANCE, EXPANDED_CONCORDANCE_ERROR, SELECTED_TAB, SELECTED_WORD } from "@/constants";
import { ParagraphData } from "@/data/paragraph";
import { SentenceBundle, WordData } from "@/data/searchv2";
import IconButton from "@/design-system/button/IconButton";
import TextButton from "@/design-system/button/TextButton";
import { createUrl } from "@/util/util";
import axios from "axios";

interface ParagraphDetailsProps {
    id: string;
    keyword: WordData;
    keywordErrId: number | undefined;
    sentenceBundle: SentenceBundle;
}

export default function ParagraphDetails({ id, keyword, keywordErrId, sentenceBundle }: ParagraphDetailsProps) {
    const t = useTranslations("Paragraph");
    const router = useRouter();
    const path = usePathname();
    const searchParams = useSearchParams();
    const selectedTab = useMemo(() => searchParams.get(SELECTED_TAB) ?? "compare", [searchParams]);
    const highlightedOrigSentenceId = sentenceBundle.orig?.id;
    const highlightedCorrSentenceId = sentenceBundle.corr?.id;

    const { data, isLoading, error } = useQuery<ParagraphData | undefined>({
        queryKey: ["paragraph", id],
        queryFn: async ({ signal }: { signal: AbortSignal }) =>
            axios.get(`/api/paragraph/${id}?keywordId=${keyword.id}`, { signal, baseURL: process.env.NEXT_PUBLIC_BASE_URL }).then((res) => res.data),
    });

    const onClick = (name: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set(SELECTED_TAB, name);
        router.replace(createUrl(path, newParams), { scroll: false });
    };

    const onCloseClick = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete(SELECTED_WORD);
        newParams.delete(SELECTED_TAB);
        newParams.delete(EXPANDED_CONCORDANCE);
        newParams.delete(EXPANDED_CONCORDANCE_ERROR);
        router.replace(createUrl(path, newParams), { scroll: false });
    };

    if (isLoading) return <ParagraphDetailsLoader />;
    if (error || !data) return <ParagraphError />;

    return (
        <div>
            <div className="flex justify-between items-center pt-4 pb-5 px-4 border-b border-static-border">
                <h4 className="text-surface-static-emphasised body-2-title">{t("heading")}</h4>

                <IconButton bg="light" shape="square" hiearchy="ghost" size="xsmall" onClick={onCloseClick}>
                    <CloseIcon />
                </IconButton>
            </div>
            <div className="px-4 py-3 flex gap-1">
                <TextButton
                    bg="light"
                    hiearchy={selectedTab === "compare" ? "primary" : "secondary"}
                    size="small"
                    onClick={() => onClick("compare")}
                >
                    {t("compare")}
                </TextButton>
                <TextButton
                    bg="light"
                    hiearchy={selectedTab === "orig" ? "primary" : "secondary"}
                    size="small"
                    onClick={() => onClick("orig")}
                >
                    {t("orig")}
                </TextButton>
                <TextButton
                    bg="light"
                    hiearchy={selectedTab === "corr" ? "primary" : "secondary"}
                    size="small"
                    onClick={() => onClick("corr")}
                >
                    {t("corr")}
                </TextButton>
                <TextButton
                    bg="light"
                    hiearchy={selectedTab === "meta" ? "primary" : "secondary"}
                    size="small"
                    onClick={() => onClick("meta")}
                >
                    {t("meta")}
                </TextButton>
            </div>

            {selectedTab === "compare" && (
                <ParagraphCompareTab data={data} sentenceBundle={sentenceBundle} keywordErrId={keywordErrId} />
            )}
            {selectedTab === "orig" && (
                <ParagraphSourceTab
                    data={data}
                    sentenceId={highlightedOrigSentenceId}
                    keyword={keyword}
                    keywordErrId={keywordErrId}
                />
            )}
            {selectedTab === "corr" && (
                <ParagraphCorrTab
                    data={data}
                    sentenceId={highlightedCorrSentenceId}
                    keyword={keyword}
                    keywordErrId={keywordErrId}
                />
            )}
            {selectedTab === "meta" && <ParagraphMetadataTab data={data} />}
        </div>
    );
}
