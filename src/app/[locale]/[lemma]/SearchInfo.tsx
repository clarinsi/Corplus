"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { TEXTS_FILTER } from "@/constants";
import { parseSearchParams } from "@/util/parsing.util";
import axios from "axios";

export default function SearchInfo() {
    const t = useTranslations("SearchInfo");
    const formatter = useFormatter();
    const searchParams = useSearchParams();
    const parsedParams = useMemo(() => parseSearchParams(searchParams), [searchParams]);
    const { data, isLoading, error } = useQuery({
        queryKey: ["corpus-count", parsedParams.searchSource, parsedParams.texts],
        queryFn: async ({ signal }: { signal: AbortSignal }) =>
            axios
                .get(
                    `/api/meta/corpus-size?source=${parsedParams.searchSource}&${TEXTS_FILTER}=${parsedParams.texts}`,
                    {
                        signal,
                    },
                )
                .then((res) => res.data),
    });

    if (isLoading) return <p className="h-4 bg-secondary animate-pulse rounded-2xl w-80" aria-label="loading"></p>;
    if (error) return <p className="caption text-surface-static-emphasised">{t("error")}</p>;

    return (
        <p className="caption text-light-grey">
            {t(parsedParams.searchSource)} / {t("size", { count: formatter.number(data.count) })}
        </p>
    );
}
