import { SearchType, WordSearchMode } from "@/app/[locale]/Search";
import { DistanceMode } from "@/components/ContextWord";
import { AdvFilterKeys } from "@/components/adv-search/config";
import { TextSource } from "@/db/schema";

export type ParsedSearchFilters = {
    lemma?: string[];
    texts?: "with-error";
    type: SearchType;
    page: number;
    rawQuery: string;
    text?: string;
    ana?: string;
    showRelative: boolean;
    searchSource: TextSource;
    showOrig: boolean;
    showCorrect: boolean;
    highlightErrors: boolean;
    leftAlign: boolean;
    firstLang?: string[];
    taskSetting?: string[];
    proficSlv?: string[];
    programType?: string[];
    inputType?: string[];
    leftDistance: number;
    rightDistance: number;
    context?: string;
    advContext?: AdvContext[];
    useExactPosition?: boolean;
    sortBy?: string;
    sortAsc: boolean;
    advancedFilters?: Record<AdvFilterKeys, string[]>;
    wordCategory?: string;
    collocationWordCategory?: string;
    errorsFilters?: string[];
    excludeCategory?: boolean;
    listType: "lemma" | "text" | "ana";
    formsFilter?: string[];
};

export type AdvContext = {
    // Can contain multiple lemmas/lemma forms
    Lemma: string[];
    NotInContext: true | undefined;
    Mode: WordSearchMode;
    Category: string;
    ExcludeCategory: true | undefined;
    DistanceMode: DistanceMode;
    LeftDistance: number;
    RightDistance: number;
    filters: Record<AdvFilterKeys, string[]>;
};

export type SearchHistoryItem = { keyword: string; url: string };
