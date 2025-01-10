import CopyButton from "@/components/CopyButton";
import { SentenceBundle, SentenceData, WordData } from "@/data/searchv2";
import { SentenceContext } from "@/data/sentence";
import { TextSource } from "@/db/schema";
import { ParsedSearchFilters } from "@/types/search.types";
import { getCleanSentenceWords } from "@/util/filter.util";
import { isInContext } from "@/util/highlight.util";
import { getMaxLeftDistance, getMaxRightDistance } from "@/util/math.util";
import { punctuationRegex } from "@/util/util";
import { clsx } from "clsx";

interface ConcordanceProps {
    parsedFilters: ParsedSearchFilters;
    sentenceBundle: SentenceBundle;
    origSentenceContext?: SentenceContext;
    corrSentenceContext?: SentenceContext;
}

export default function Concordance({
    parsedFilters,
    sentenceBundle,
    origSentenceContext,
    corrSentenceContext,
}: ConcordanceProps) {
    const searchSource = parsedFilters.searchSource;
    const { showOrig, showCorrect } = parsedFilters;

    const shouldShowOrig = showOrig && (hasErrors(sentenceBundle.orig) || searchSource !== "CORR");
    const shouldShowCorrect = showCorrect && (hasErrors(sentenceBundle.corr) || searchSource !== "ORIG");
    const showDivider = (searchSource === "ORIG" && shouldShowCorrect) || (searchSource === "CORR" && shouldShowOrig);

    return (
        <div className="px-4 border-b border-static-border hover:bg-surface-static-secondary transition-all duration-200">
            {shouldShowOrig && (
                <SentenceEntry
                    parsedFilters={parsedFilters}
                    sentenceType="ORIG"
                    sentence={sentenceBundle.orig!}
                    sentenceContext={origSentenceContext}
                    keyword={sentenceBundle.keyword}
                />
            )}

            {showDivider && <hr className="text-static-border mx-1" />}

            {shouldShowCorrect && (
                <SentenceEntry
                    parsedFilters={parsedFilters}
                    sentenceType="CORR"
                    sentence={sentenceBundle.corr!}
                    sentenceContext={corrSentenceContext}
                    keyword={sentenceBundle.keyword}
                />
            )}
        </div>
    );
}

interface SentenceProps {
    parsedFilters: ParsedSearchFilters;
    sentenceType: TextSource;
    sentence: SentenceData;
    sentenceContext?: SentenceContext;
    keyword: WordData;
}

function SentenceEntry({ keyword, parsedFilters, sentenceType, sentence, sentenceContext }: SentenceProps) {
    const { context, advContext } = parsedFilters;
    // Represents keyword index in the sentence
    const localKeyword = sentence.words.find((w) => w.isKeyword);
    const localKeywordIndex = sentence.words.findIndex((word) => word.isKeyword);

    // Filter out any special characters since they are not counted as words in distance calculations
    const cleanSentence = getCleanSentenceWords(sentence.words);
    const cleanKeywordIndex = cleanSentence.findIndex((w) => w.id === localKeyword?.id);

    const leftDistance = getMaxLeftDistance(parsedFilters);
    const rightDistance = getMaxRightDistance(parsedFilters);

    const handleCopy = async () => {
        const text = sentence.words.map((w) => (punctuationRegex.test(w.text) ? w.text : ` ${w.text}`)).join("");
        await navigator.clipboard.writeText(text);
    };

    const generateWordElement = (word: WordData) => {
        const wordIndex = cleanSentence.findIndex((w) => w.id === word.id);

        const hasError = word.errors.length > 0 && parsedFilters.highlightErrors;
        const isBold =
            word.isKeyword ||
            isInContext(word, wordIndex, cleanKeywordIndex, context, advContext, leftDistance, rightDistance) ||
            word.errors.some((e) => e.groupId === keyword.errors.at(0)?.groupId);
        const classes = clsx(
            hasError && (sentenceType === "CORR" ? "text-semantic-correct" : "text-semantic-error"),
            isBold && "font-bold",
        );

        return (
            <span key={word.id} className={classes} data-id={word.id}>
                {punctuationRegex.test(word.text) ? "" : " "}
                {word.text}
            </span>
        );
    };

    let content;
    if (parsedFilters.leftAlign) {
        content = <p className="py-3 body-2">{sentence.words.map(generateWordElement)}</p>;
    }

    if (!parsedFilters.leftAlign) {
        content = (
            <>
                <p className="py-3 grow grid grid-cols-2 gap-1.5 body-2">
                    <span className="whitespace-nowrap overflow-hidden text-clip">
                        <span className="float-right inline-block text-right">
                            {sentenceContext && sentenceContext.preceeding?.words}
                            {sentence.words.slice(0, localKeywordIndex).map(generateWordElement)}
                        </span>
                    </span>

                    <span className="whitespace-nowrap overflow-hidden text-clip">
                        <span className="float-left inline-block text-right">
                            {sentence.words.slice(localKeywordIndex).map(generateWordElement)}
                            {sentenceContext && sentenceContext.following?.words}
                        </span>
                    </span>
                </p>
            </>
        );
    }

    return (
        <div className="flex justify-between items-center" data-id={sentence.id}>
            {content}
            <div className="pl-3">
                <CopyButton onClick={handleCopy} />
            </div>
        </div>
    );
}

const hasErrors = (sentence: SentenceData | undefined) => {
    if (!sentence) return false;
    return sentence.words.some((w) => w.errors.length > 0);
};
