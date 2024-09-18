import { Suspense } from "react";
import ViewControl from "@/app/[locale]/[lemma]/ViewControl";

interface SearchResultsLoaderProps {
    hideViewControl?: boolean;
}

export default function SearchResultsLoader({ hideViewControl = false }: SearchResultsLoaderProps) {
    const getLine = (i: number) => (
        <div key={i} className="border-b border-static-border px-4">
            <div className="animate-pulse bg-secondary h-6 my-3 rounded-md" />
        </div>
    );

    return (
        <div className="bg-white shadow-tiny rounded overflow-hidden col-span-3 flex flex-col justify-between">
            <div className="flex justify-between border-b border-static-border">
                <Suspense>{!hideViewControl && <ViewControl />}</Suspense>
            </div>

            <div className="grow">{Array.from({ length: 25 }, (_, i) => i).map(getLine)}</div>
        </div>
    );
}
