import { LIST_SEPARATOR, NO_STRING_SEARCH } from "@/constants";
import {
    AliasContainer,
    addCollocationErrorJoins,
    addCollocationJoins,
    getCollocationAliases,
    getCollocationErrorAliases,
} from "@/data/collocation";
import { getMappedAdvFiltersQuery } from "@/data/search";
import { dbClient } from "@/db/db";
import { Bibl, Err, Sentence, TextSource, Word } from "@/db/schema";
import { ParsedSearchFilters } from "@/types/search.types";
import { and, asc, count, eq, ilike, like, not, or } from "drizzle-orm";
import { PgSelect } from "drizzle-orm/pg-core";
import { inArray } from "drizzle-orm/sql/expressions/conditions";

interface WordError {
    id: number;
    type: string;
    groupId: string;
    origWordId: string | null;
    corrWordId: string | null;
    origSentenceId: string | null;
    corrSentenceId: string | null;
    origParagraphId: string | null;
    corrParagraphId: string | null;
}

export interface WordData {
    id: string;
    type: TextSource;
    biblId?: string;
    ana: string;
    lemma: string | null;
    text: string;
    sentenceId: string;
    errors: WordError[];
    contextErrors: {
        id: number;
        wordId: string;
    }[];
    isKeyword: boolean;
}

export interface SentenceData {
    id: string;
    paragraphId: string;
    type: string;
    words: WordData[];
}

export interface SentenceBundle {
    keywordId: string;
    keyword: WordData;
    orig: SentenceData | undefined;
    corr: SentenceData | undefined;
}

export const getBiblQuery2 = (parsedSearchFilters: ParsedSearchFilters) =>
    and(
        parsedSearchFilters.firstLang && inArray(Bibl.FirstLang, parsedSearchFilters.firstLang),
        parsedSearchFilters.taskSetting && inArray(Bibl.TaskSetting, parsedSearchFilters.taskSetting),
        parsedSearchFilters.proficSlv && inArray(Bibl.ProficSlv, parsedSearchFilters.proficSlv),
        parsedSearchFilters.programType && inArray(Bibl.ProgramType, parsedSearchFilters.programType),
        parsedSearchFilters.inputType && inArray(Bibl.InputType, parsedSearchFilters.inputType),
    );

export const getWhereQuery = (
    parsedSearchFilters: ParsedSearchFilters,
    biblOverride: any | undefined = undefined,
    aliases?: AliasContainer<typeof Word>,
) => {
    const { lemma, errorsFilters, searchSource, type: searchType, formsFilter } = parsedSearchFilters;
    const biblFilters = biblOverride !== undefined ? biblOverride : getBiblQuery2(parsedSearchFilters);
    const mappedAdvFilters = getMappedAdvFiltersQuery(
        parsedSearchFilters.wordCategory,
        parsedSearchFilters.excludeCategory,
        parsedSearchFilters.advancedFilters,
    );

    let wordFilterQuery;
    if ((searchType === "basic" || searchType === "collocations") && lemma !== NO_STRING_SEARCH) {
        wordFilterQuery = inArray(Word.lemma, lemma);
    }

    // We only support wildcard searches for a single word
    if (searchType === "list" && lemma !== NO_STRING_SEARCH) {
        // Convert wildcard characters to SQL wildcards
        const adjustedLemma = lemma[0].replaceAll("*", "%").replaceAll("?", "_");
        wordFilterQuery = ilike(Word.text, adjustedLemma);
    }

    const { context, advContext, collocationWordCategory } = parsedSearchFilters;
    let contextQuery;
    if (aliases && context && advContext === undefined) {
        if (!parsedSearchFilters.useExactPosition) {
            const { left, right } = aliases;
            const leftQuery = left.map((alias) => eq(alias.lemma, context));
            const rightQuery = right.map((alias) => eq(alias.lemma, context));
            contextQuery = or(...leftQuery, ...rightQuery);
        }
    }

    if (aliases && collocationWordCategory) {
        const categories = collocationWordCategory.split(LIST_SEPARATOR);
        const { left, right } = aliases;
        const leftQuery = left.map((alias) =>
            or(
                ...categories.map((cat) =>
                    parsedSearchFilters.context
                        ? and(like(alias.ana, `mte:${cat}%`), eq(alias.lemma, parsedSearchFilters.context))
                        : like(alias.ana, `mte:${cat}%`),
                ),
            ),
        );
        const rightQuery = right.map((alias) =>
            or(
                ...categories.map((cat) =>
                    parsedSearchFilters.context
                        ? and(like(alias.ana, `mte:${cat}%`), eq(alias.lemma, parsedSearchFilters.context))
                        : like(alias.ana, `mte:${cat}%`),
                ),
            ),
        );
        contextQuery = or(...leftQuery, ...rightQuery);
    }

    if (aliases && advContext !== undefined) {
        const { left, right } = aliases;
        contextQuery = advContext.map((ctx) => {
            let ctxQuery;
            const modeField = ctx.Mode === "lemma" ? "lemma" : "text";

            const advacedAnaFilters = getMappedAdvFiltersQuery(ctx.Category, ctx.ExcludeCategory, ctx.filters);

            if (ctx.DistanceMode === "exact") {
                const tmp = [];
                const leftAlias = left.at(ctx.LeftDistance - 1);
                const rightAlias = right.at(ctx.RightDistance - 1);

                if (leftAlias) {
                    tmp.push(and(inArray(leftAlias[modeField], ctx.Lemma), ...advacedAnaFilters));
                }

                if (rightAlias) {
                    tmp.push(and(inArray(rightAlias[modeField], ctx.Lemma), ...advacedAnaFilters));
                }

                ctxQuery = and(...tmp);
            } else {
                const leftQuery = left.map((alias) => and(inArray(alias[modeField], ctx.Lemma), ...advacedAnaFilters));
                const rightQuery = right.map((alias) =>
                    and(inArray(alias[modeField], ctx.Lemma), ...advacedAnaFilters),
                );
                ctxQuery = or(...leftQuery, ...rightQuery);
            }

            // Negate if NotInContext is true
            if (ctx.NotInContext) {
                if (!ctxQuery) return;
                return not(ctxQuery);
            }

            return ctxQuery;
        });
    }

    let fFilters = [];
    if (formsFilter) {
        for (const form of formsFilter) {
            const tmp = [];
            const split = form.split(" ");

            // Main lemma filter
            tmp.push(eq(Word.lemma, split.shift()!));

            if (split.length === 0 || !aliases) {
                fFilters.push(and(...tmp));
                continue;
            }

            // Context words filter
            split.forEach((word, index) => {
                const alias = aliases.right.at(index);
                if (!alias) return;

                tmp.push(eq(alias.lemma, word));
            });

            fFilters.push(and(...tmp));
        }
    }

    const mappedErrFilters = errorsFilters ? inArray(Err.type, errorsFilters) : undefined;

    const result = [
        eq(Word.type, searchSource),
        biblFilters,
        wordFilterQuery,
        mappedErrFilters,
        ...mappedAdvFilters,
        or(...fFilters),
    ];

    if (contextQuery instanceof Array) {
        result.push(...contextQuery);
    } else {
        result.push(contextQuery);
    }

    return result;
};

export function applySentenceWithErrorsFilter<T extends PgSelect>(
    queryBuilder: T,
    parsedSearchFilters: ParsedSearchFilters,
) {
    const errSentenceSource = parsedSearchFilters.searchSource === "ORIG" ? Err.origSentenceId : Err.corrSentenceId;
    const sq = dbClient
        .selectDistinct({ id: Sentence.id })
        .from(Sentence)
        .innerJoin(Err, eq(errSentenceSource, Sentence.id))
        .where(not(eq(Err.type, "ID")))
        .as("sq");

    // Joins a subquery that filters out sentences that don't have errors
    queryBuilder.innerJoin(sq, eq(Word.sentenceId, sq.id));
}

export function getWordSearchFilters<T extends PgSelect>(
    queryBuilder: T,
    parsedSearchFilters: ParsedSearchFilters,
    biblOverride: any | undefined = undefined,
    skipErr: boolean = false,
    skipContextJoins: boolean = false,
    aliasOverride: any = undefined,
    errAliasOverride: any = undefined,
) {
    const { searchSource, texts, leftDistance, rightDistance, advContext } = parsedSearchFilters;

    if (texts === "with-error") {
        applySentenceWithErrorsFilter(queryBuilder, parsedSearchFilters);
    }

    queryBuilder.innerJoin(Bibl, eq(Word.biblId, Bibl.id));

    if (!skipErr) {
        const wordSource = searchSource === "CORR" ? eq(Err.corrWordId, Word.id) : eq(Err.origWordId, Word.id);
        queryBuilder.innerJoin(Err, wordSource);
    }

    let aliases;
    let errAliases;
    if (!skipContextJoins && advContext === undefined) {
        aliases = getCollocationAliases(leftDistance, rightDistance);
        errAliases = getCollocationErrorAliases(parsedSearchFilters.leftDistance, parsedSearchFilters.rightDistance);
        addCollocationJoins(queryBuilder, aliases);
        addCollocationErrorJoins(
            queryBuilder,
            parsedSearchFilters.searchSource,
            aliases,
            errAliasOverride || errAliases,
        );
    }

    if (!skipContextJoins && advContext !== undefined) {
        const biggestLeftDistance = Math.max(...advContext.map((ctx) => ctx.LeftDistance));
        const biggestRightDistance = Math.max(...advContext.map((ctx) => ctx.RightDistance));
        aliases = getCollocationAliases(biggestLeftDistance, biggestRightDistance);
        errAliases = getCollocationErrorAliases(biggestLeftDistance, biggestRightDistance);
        addCollocationJoins(queryBuilder, aliases);
        addCollocationErrorJoins(
            queryBuilder,
            parsedSearchFilters.searchSource,
            aliases,
            errAliasOverride || errAliases,
        );
    }

    return getWhereQuery(parsedSearchFilters, biblOverride, aliasOverride ?? aliases);
}

export const getWords = async (parsedSearchFilters: ParsedSearchFilters, limit: number = 25): Promise<WordData[]> => {
    const { page } = parsedSearchFilters;
    let errAliases;

    const { advContext } = parsedSearchFilters;
    if (advContext === undefined) {
        errAliases = getCollocationErrorAliases(parsedSearchFilters.leftDistance, parsedSearchFilters.rightDistance);
    } else {
        const biggestLeftDistance = Math.max(...advContext.map((ctx) => ctx.LeftDistance));
        const biggestRightDistance = Math.max(...advContext.map((ctx) => ctx.RightDistance));
        errAliases = getCollocationErrorAliases(biggestLeftDistance, biggestRightDistance);
    }

    const wordType = parsedSearchFilters.searchSource === "ORIG" ? "origWordId" : "corrWordId";
    const selector: Record<string, any> = {
        word: Word,
        errors: Err,
    };

    errAliases.left.forEach((l, i) => (selector[`leftErr${i}`] = { id: l.id, wordId: l[wordType] }));
    errAliases.right.forEach((r, i) => (selector[`rightErr${i}`] = { id: r.id, wordId: r[wordType] }));

    const queryBuilder = dbClient.select(selector).from(Word).$dynamic();

    queryBuilder.where(
        and(...getWordSearchFilters(queryBuilder, parsedSearchFilters, undefined, false, false, undefined, errAliases)),
    );

    queryBuilder
        .orderBy(asc(Word.sentenceId))
        .limit(limit)
        .offset((page - 1) * 25);

    const result: any = await queryBuilder.prepare("words").execute();

    return result.map((w: any) => ({
        id: w.word.id,
        biblId: w.word.biblId,
        type: w.word.type,
        ana: w.word.ana,
        lemma: w.word.lemma,
        text: w.word.text,
        sentenceId: w.word.sentenceId!,
        errors: [
            {
                id: w.errors.id,
                type: w.errors.type,
                groupId: w.errors.groupId,
                origWordId: w.errors.origWordId,
                corrWordId: w.errors.corrWordId,
                origSentenceId: w.errors.origSentenceId,
                corrSentenceId: w.errors.corrSentenceId,
                origParagraphId: w.errors.origParagraphId,
                corrParagraphId: w.errors.corrParagraphId,
            },
        ],
        contextErrors: Object.entries(w).filter(([k, v]) => k.includes("Err") && v !== null && v !== undefined),
        isKeyword: true,
    }));
};

const getWordsCount = async (parsedSearchFilters: ParsedSearchFilters): Promise<number> => {
    const queryBuilder = dbClient.select({ count: count() }).from(Word).$dynamic();
    queryBuilder.where(and(...getWordSearchFilters(queryBuilder, parsedSearchFilters)));
    const result = await queryBuilder;
    return result.at(0)?.count ?? -1;
};

export const getSentences = async (words: WordData[]): Promise<SentenceBundle[]> => {
    const processedSentences: SentenceBundle[] = [];

    const sentenceIds: string[] = [];
    for (const word of words) {
        const firstError = word.errors.at(0);
        if (!firstError) {
            console.warn("No error data found for word", word);
            return [];
        }

        const { origSentenceId, corrSentenceId } = firstError;
        const ids = [origSentenceId, corrSentenceId].filter((id) => id !== null) as string[];
        sentenceIds.push(...ids);
    }

    if (sentenceIds.length === 0) {
        console.warn("No sentence IDs found for words", words);
        return [];
    }

    const sentences = await dbClient.query.Sentence.findMany({
        where: inArray(Sentence.id, sentenceIds),
        with: {
            words: {
                orderBy: asc(Word.sentenceId),
                with: {
                    origErrors: true,
                    corrErrors: true,
                },
            },
        },
    });

    for (const keyword of words) {
        const firstError = keyword.errors.at(0);
        if (!firstError) return [];

        const { origSentenceId, corrSentenceId } = firstError;

        const origSentence = sentences.find((s) => s.id === origSentenceId);
        const corrSentence = sentences.find((s) => s.id === corrSentenceId);
        let newOrigSentence: SentenceData | undefined = undefined;
        let newCorrSentence: SentenceData | undefined = undefined;

        if (origSentence) {
            newOrigSentence = {
                id: origSentence.id,
                type: origSentence.type,
                paragraphId: origSentence.paragraphId,
                words: origSentence.words
                    .map((w) => mapSentenceWord(w, keyword))
                    .sort((a, b) => a.id.localeCompare(b.id)),
            };
        }

        if (corrSentence) {
            newCorrSentence = {
                id: corrSentence.id,
                paragraphId: corrSentence.paragraphId,
                type: corrSentence.type,
                words: corrSentence.words
                    .map((w) => mapSentenceWord(w, keyword))
                    .sort((a, b) => a.id.localeCompare(b.id)),
            };
        }

        processedSentences.push({
            keywordId: keyword.id,
            keyword: keyword,
            orig: newOrigSentence,
            corr: newCorrSentence,
        });
    }

    return processedSentences;
};

const mapSentenceWord = (
    word: Omit<WordData, "isKeyword" | "errors" | "contextErrors"> & {
        origErrors: WordError[];
        corrErrors: WordError[];
    },
    keyword: WordData,
): WordData => {
    const { id, biblId, type, ana, lemma, text, sentenceId, origErrors, corrErrors } = word;
    const currentErrors = type === "ORIG" ? origErrors : corrErrors;
    const keywordError = currentErrors.find((err) => err.origWordId === keyword.id || err.corrWordId === keyword.id);
    const filteredErrors = currentErrors?.filter((err) => err.type !== "ID") ?? [];

    return {
        id,
        type,
        ana,
        lemma,
        text,
        sentenceId: sentenceId!,
        errors: filteredErrors,
        contextErrors: [],
        isKeyword: id === keyword.id || keywordError !== undefined,
    };
};

export const getPaginatedSearchResultsv2 = async (
    parsedSearchFilters: ParsedSearchFilters,
): Promise<PaginatedResponse<SentenceBundle[]>> => {
    // Get total word count for pagination
    const totalWordsCount = await getWordsCount(parsedSearchFilters);

    // Get all words (page X) that match the search query
    const words = await getWords(parsedSearchFilters);

    // Get sentences for each word
    const sentences = await getSentences(words);

    // Metadata
    const encodedLemma = encodeURIComponent(parsedSearchFilters.rawQuery);
    const currentPage = parsedSearchFilters.page;
    const totalPages = Math.ceil(totalWordsCount / 25);

    return {
        data: sentences,
        meta: { currentPage, itemsPerPage: 25, totalItems: totalWordsCount, totalPages },
        links: {
            first: `/${encodedLemma}?page=1`,
            previous: `/${encodedLemma}?page=${currentPage > 2 ? currentPage - 1 : 1}`,
            current: `/${encodedLemma}?page=${currentPage}`,
            next: `/${encodedLemma}?page=${currentPage + 1}`,
            last: `/${encodedLemma}?page=${totalPages}`,
        },
    };
};
