import { ParsedSearchFilters } from "@/types/search.types";

export const getMaxLeftDistance = (parsedFilters: ParsedSearchFilters) => {
    return Math.max(parsedFilters.leftDistance, ...(parsedFilters.advContext?.map((w) => w.LeftDistance) || []));
};

export const getMaxRightDistance = (parsedFilters: ParsedSearchFilters) => {
    return Math.max(parsedFilters.rightDistance, ...(parsedFilters.advContext?.map((w) => w.RightDistance) || []));
};
