import { ReadonlyURLSearchParams } from "next/navigation";
import { WordData } from "@/data/searchv2";
import { ErrInsert } from "@/db/schema";

export const isDev = process.env.NODE_ENV === "development";

export const punctuationRegex = /^[!"#$%&'*+,./:;<=>?@^_`{|}~]/g;

export const createUrl = (pathname: string, params: URLSearchParams | ReadonlyURLSearchParams) => {
    const paramsString = params.toString();
    const queryString = `${paramsString.length ? "?" : ""}${paramsString}`;

    return `${pathname}${queryString}`;
};

export const getSelectedWordError = (
    id: string | null,
    errs: ErrInsert[],
    keyword: WordData,
    keywordErrOverrideId?: number,
    contextErrOverrideId?: string,
) => {
    if (!id) return null;
    if (keyword.contextErrors.find((e) => e.wordId === id) && contextErrOverrideId) {
        return errs.find((e) => e.id === Number(contextErrOverrideId));
    }
    if ((id === keyword.id || id === keyword.errors?.at(0)?.corrWordId) && keywordErrOverrideId) {
        return errs.find((e) => e.id === keywordErrOverrideId);
    }
    return errs.find((e) => e.origWordId === id || e.corrWordId === id);
};
