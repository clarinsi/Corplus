import { Suspense } from "react";
import CollocationsWordClassesList from "@/components/filters/CollocationsWordClassesList";
import ErrorsSidebarFiltersList from "@/components/filters/ErrorsSidebarFiltersList";
import GenericSidebarFilter from "@/components/filters/GenericSidebarFilter";
import LemmaFormsList from "@/components/filters/LemmaFormsList";
import WordClassesList from "@/components/filters/WordClassesList";
import FilterListLoader from "@/components/loaders/FilterListLoader";
import {
    FIRST_LANG_FILTER,
    INPUT_TYPE_FILTER,
    PROFIC_SLV_FILTER,
    PROGRAM_TYPE_FILTER,
    TASK_SETTING_FILTER,
} from "@/constants";
import { BiblInsert } from "@/db/schema";
import { parseRawFilters } from "@/util/parsing.util";

interface GenericSidebarFilterProps {
    fieldName: keyof BiblInsert;
    paramName: string;
    titleLangKey: string;
    showRel: boolean;
    showSelectAll?: boolean;
}

const sidebarFiltersConfig: Pick<
    GenericSidebarFilterProps,
    "fieldName" | "titleLangKey" | "paramName" | "showSelectAll"
>[] = [
    {
        fieldName: "FirstLang",
        titleLangKey: "first-lang",
        paramName: FIRST_LANG_FILTER,
        showSelectAll: true,
    },
    {
        fieldName: "TaskSetting",
        titleLangKey: "task-setting",
        paramName: TASK_SETTING_FILTER,
        showSelectAll: true,
    },
    {
        fieldName: "ProficSlv",
        titleLangKey: "profic-slv",
        paramName: PROFIC_SLV_FILTER,
        showSelectAll: true,
    },
    {
        fieldName: "ProgramType",
        titleLangKey: "program-type",
        paramName: PROGRAM_TYPE_FILTER,
        showSelectAll: true,
    },
    {
        fieldName: "InputType",
        titleLangKey: "input-type",
        paramName: INPUT_TYPE_FILTER,
        showSelectAll: true,
    },
];

interface FiltersSidebarProps {
    searchParams: Record<string, string>;
    currentLemma: string;
    hideLemmaForms?: boolean;
    showWordClass?: boolean;
    showCollocationsWordClass?: boolean;
}

export default function FiltersSidebar({
    searchParams,
    currentLemma,
    hideLemmaForms = false,
    showWordClass = false,
    showCollocationsWordClass = false,
}: FiltersSidebarProps) {
    const parsedFilters = parseRawFilters(searchParams);

    return (
        <>
            {!hideLemmaForms && <LemmaFormsList parsedFilters={parsedFilters} currentLemma={currentLemma} />}

            {showWordClass && <WordClassesList parsedFilters={parsedFilters} currentLemma={currentLemma} />}
            {showCollocationsWordClass && (
                <CollocationsWordClassesList parsedFilters={parsedFilters} currentLemma={currentLemma} />
            )}

            <Suspense fallback={<FilterListLoader titleLangKey="first-lang" />}>
                <GenericSidebarFilter
                    currentLemma={currentLemma}
                    fieldName="FirstLang"
                    paramName={FIRST_LANG_FILTER}
                    titleLangKey="first-lang"
                    showRel={parsedFilters.showRelative}
                    showSelectAll={true}
                />
            </Suspense>

            <ErrorsSidebarFiltersList parsedFilters={parsedFilters} />

            {sidebarFiltersConfig.slice(1).map((filter) => (
                <Suspense key={filter.paramName} fallback={<FilterListLoader titleLangKey={filter.titleLangKey} />}>
                    <GenericSidebarFilter
                        currentLemma={currentLemma}
                        fieldName={filter.fieldName}
                        paramName={filter.paramName}
                        titleLangKey={filter.titleLangKey}
                        showRel={parsedFilters.showRelative}
                        showSelectAll={filter.showSelectAll}
                    />
                </Suspense>
            ))}
        </>
    );
}
