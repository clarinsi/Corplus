"use client";

import { useQuery } from "@tanstack/react-query";
import SpeakerLangFilter from "@/components/filters/SpeakerLangFilter";
import { BiblFilter } from "@/data/filters";

export default function AsyncSpeakerLangFilter() {
    const { data, isLoading, error } = useQuery<BiblFilter[]>({
        queryKey: ["firstLangFilters"],
        queryFn: async ({ signal }: { signal: AbortSignal }) =>
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/filters/bibl/fl-global`, { signal }).then((res) => res.json()),
    });

    if (isLoading) return <></>;
    if (error) return <></>;

    return <SpeakerLangFilter bg="light" size="small" filters={data} />;
}
