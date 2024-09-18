import { AdvFilterKeys, advFiltersSchema } from "@/components/adv-search/config";
import { Word } from "@/db/schema";
import { and, like, not, or } from "drizzle-orm";

export const getMappedAdvFiltersQuery = (
    wordCategory: string | undefined,
    excludeCategory: boolean | undefined,
    advancedFilters?: Record<AdvFilterKeys, string[]>,
) => {
    // Return empty array if no advanced filters are selected
    if (!wordCategory || !advancedFilters) return [];

    // Get the schema for the selected word category
    const categorySchema = advFiltersSchema[wordCategory];

    // Map the selected advanced filters to a query
    const mapped = Object.entries(advancedFilters).flatMap(([key, values]) => {
        // Get the index of the current filter in the schema
        const schemaIndex = categorySchema.indexOf(key as AdvFilterKeys);
        if (schemaIndex === -1) {
            throw new Error(`Invalid advanced filter: ${key}`);
        }
        // Create a string of underscores to fill the offset (used for SQL wildcards)
        const offsetFiller = "_".repeat(schemaIndex);

        const v = values.map((value) => like(Word.ana, `mte:${wordCategory}${offsetFiller}${value}%`));
        const stmt = or(...v);

        if (!stmt) return [];
        return stmt;
    });

    if (excludeCategory) {
        const a = and(...mapped);
        if (!a) return [];
        return [not(a)];
    } else if (mapped.length === 0) {
        mapped.push(like(Word.ana, `mte:${wordCategory}%`));
    }

    return mapped;
};
