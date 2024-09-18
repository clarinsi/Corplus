import { FilterItem } from "@/components/filters/ErrorsDropdownFilter";
import { SidebarFilterItem } from "@/components/filters/ErrorsSidebarFiltersList";
import { WordData } from "@/data/searchv2";

export const getCategoryItemsCodes = (category: FilterItem): string[] => {
    if (category.children?.length ?? 0 > 0) {
        return category.children!.flatMap(getCategoryItemsCodes);
    }

    if (!category.value) {
        return [];
    }

    return [category.value];
};

export const getCategoryValueSum = (item: SidebarFilterItem): { count: number; relativeCount: number } => {
    if (item.children?.length ?? 0 > 0) {
        return item.children!.reduce(
            (acc, child) => {
                const { count, relativeCount } = getCategoryValueSum(child);
                return {
                    count: acc.count + count,
                    relativeCount: acc.relativeCount + relativeCount,
                };
            },
            { count: 0, relativeCount: 0 },
        );
    }

    return {
        count: item.count ?? 0,
        relativeCount: item.relative ?? 0,
    };
};

/**
 * Removes any special characters from words array
 * Used for calculating distance between word and keyword
 * @param words
 */
export const getCleanSentenceWords = (words: WordData[]) => words.filter((w) => /\w/.test(w.text));
