import { dbClient, queryClient } from "@/db/db";
import { Bibl, BiblInsert } from "@/db/schema/bibl.schema";
import { Err, ErrInsert } from "@/db/schema/err.schema";
import { CountMeta, TextSource } from "@/db/schema/etc.schema";
import { Paragraph } from "@/db/schema/paragraph.schema";
import { Sentence, SentenceInsert } from "@/db/schema/sentence.schema";
import { Word, WordInsert } from "@/db/schema/word.schema";
import chalk from "chalk";
import { and, count, countDistinct, desc, eq, not, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import fs from "fs";
import { nanoid } from "nanoid";
import postgres from "postgres";
import XmlStream from "xml-stream";

const importDir = "./import/";
const origFile = importDir + "kost-orig.xml";
const errFile = importDir + "kost-errs.xml";
const corrFile = importDir + "kost-corr.xml";

const zeroPadId = (id: string) => {
    // Use a regular expression to match "s/t." followed by numbers
    const regex = /([st]\..+)/g;

    // Replace each match with a zero-padded version
    return id.replace(regex, (match) => {
        const numbers = match.slice(2); // Extract numbers after "s./t."
        const zeroPadded = numbers
            .split(".")
            .map((num) => {
                if (isNaN(Number(num))) return num;
                return num.padStart(3, "0");
            })
            .join(".");
        return `${match.slice(0, 1)}.${zeroPadded}`;
    });
};

const parseFile = async (
    file: string,
    endElement: string,
    collect: string[],
    dataHandler: (data: any) => Promise<void>,
): Promise<void> => {
    return new Promise((resolve, reject) => {
        console.log(chalk.blue("Processing file"), file);

        try {
            // Make sure file exists
            if (!fs.existsSync(file)) {
                console.error(chalk.red("File not found:"), file);
                return;
            }

            const fileStream = fs.createReadStream(file, "utf-8");
            const xmlStream = new XmlStream(fileStream);

            // Collect specified tags
            // noinspection JSUnresolvedReference
            collect.forEach((tag) => xmlStream.collect(tag));

            console.log(chalk.blue("Parsing file"), file);

            const maxConcurrency = 100; // Concurrency level to prevent overloading the database
            const inProgress = new Set();

            xmlStream.on(`endElement: ${endElement}`, async (data: any) => {
                if (inProgress.size >= maxConcurrency) {
                    xmlStream.pause();
                    await Promise.all(inProgress);
                    xmlStream.resume();
                }

                const dataPromise = dataHandler(data);
                inProgress.add(dataPromise);
                await dataPromise.finally(() => inProgress.delete(dataPromise));
            });

            xmlStream.on("end", async () => {
                console.log(chalk.green("Done parsing file"), file);
                fileStream.close();

                // Wait for all pending data to finish processing
                await Promise.all(inProgress);

                resolve();
            });
        } catch (e) {
            reject(e);
        }
    });
};

const origDataHandler = async (data: OrigXmlData, dataType: TextSource) => {
    // Bibl parsing
    const biblId = data.bibl.$.n;

    const parsedBiblData: Partial<BiblInsert> = {
        id: biblId,
    };

    // Don't parse corr bibl data as it's the same as orig
    if (dataType == "ORIG") {
        data.bibl.note.forEach((note) => {
            const type = note.$!.ana.slice(1) as keyof BiblInsert;
            parsedBiblData[type] = note.$text!;
        });

        await dbClient.insert(Bibl).values(parsedBiblData as BiblInsert);
    }
    // End bibl parsing

    // Sentence & word parsing
    for (const paragraph of data.p) {
        const paragraphId = zeroPadId(paragraph.$["xml:id"]);

        await dbClient.insert(Paragraph).values({
            id: paragraphId,
            biblId,
            type: dataType,
            origParagraphId: dataType === "CORR" ? paragraphId.replace("t.", "s.") : null,
        });

        const sentences: SentenceInsert[] = [];
        const words: WordInsert[] = [];

        for (const sentence of paragraph.s) {
            const sentenceId = zeroPadId(sentence.$["xml:id"]);

            // Make sure w tag is an array
            sentence.w = sentence.w ?? [];

            // Merge seg tag content into sentence
            if (sentence.seg !== undefined) {
                sentence.w?.push(...sentence.seg.flatMap((seg) => seg.w || []));
                sentence.w?.push(...sentence.seg.flatMap((seg) => seg.pc || []));
            }

            const sentenceData: SentenceInsert = {
                id: sentenceId,
                type: dataType,
                biblId,
                paragraphId,
            };

            const parsedWords: WordInsert[] = [];

            // Merge pc tags into w tag
            if (sentence.pc !== undefined) {
                const isArr = Array.isArray(sentence.pc);
                if (isArr) sentence.w?.push(...(sentence.pc as PcNode[]));
                else sentence.w?.push(sentence.pc as PcNode);
            }

            // Zero pad word ids
            sentence.w.forEach((word) => {
                word.$["xml:id"] = zeroPadId(word.$["xml:id"]);
            });

            // Sort by word id and lemma (if lemma is null, it will be sorted to the end)
            sentence.w.sort((a, b) => {
                // Check for undefined or null lemma first
                if (!a.$.lemma) {
                    return 1;
                } else if (!b.$.lemma) {
                    return -1;
                }

                // Sort by id if both lemmas are defined
                return a.$["xml:id"].localeCompare(b.$["xml:id"]);
            });

            for (const [index, word] of sentence.w.entries() || []) {
                const prevWord = sentence.w.at(index - 1);
                const nextWord = sentence.w.at(index + 1);
                const isLemmaNull = word.$.lemma === undefined;

                parsedWords.push({
                    id: word.$["xml:id"],
                    biblId,
                    type: dataType,
                    ana: word.$.ana,
                    lemma: word.$.lemma ?? null,
                    text: word.$text,
                    prevContext: prevWord?.$.lemma !== undefined && !isLemmaNull ? prevWord.$["xml:id"] : null,
                    nextContext: nextWord?.$.lemma !== undefined && !isLemmaNull ? nextWord.$["xml:id"] : null,
                    sentenceId,
                });
            }

            words.push(...parsedWords);
            sentences.push(sentenceData);
        }

        await dbClient.insert(Sentence).values(sentences);
        await dbClient.insert(Word).values(words);
    }
    // End Sentence & word parsing
};

const errDataHandler = async (data: ErrXmlData) => {
    try {
        const correspSplit = data.$.corresp.split(" ");
        const origParagraphId = zeroPadId(correspSplit[0].slice(1));
        const corrParagraphId = zeroPadId(correspSplit[1].slice(1));

        let errBuffer = [];
        for (const link of data.link) {
            const groupId = nanoid();
            const splitTarget = link.$.target.split(" ");
            const zeroPadTargets = splitTarget.map((target) => zeroPadId(target.replace("#", "").trim()));
            const origTargets = zeroPadTargets.filter((target) => target.includes("s."));
            const corrTargets = zeroPadTargets.filter((target) => target.includes("t."));

            let output: ErrInsert[] = [];

            while (origTargets.length > 0) {
                const origTarget = origTargets.shift()!;
                const corrTarget = corrTargets.shift() ?? null;

                const origSentenceId = origTarget.slice(0, -4);
                const corrSentenceId = corrTarget?.slice(0, -4) ?? null;

                output.push({
                    type: link.$.type,
                    origWordId: origTarget,
                    corrWordId: corrTarget,
                    origSentenceId,
                    corrSentenceId,
                    origParagraphId,
                    corrParagraphId,
                    groupId,
                });
            }

            while (corrTargets.length > 0) {
                const corrTarget = corrTargets.shift()!;
                const corrSentenceId = corrTarget?.slice(0, -4) ?? null;

                output.push({
                    type: link.$.type,
                    origWordId: null,
                    corrWordId: corrTarget,
                    origSentenceId: null,
                    corrSentenceId,
                    origParagraphId,
                    corrParagraphId,
                    groupId,
                });
            }

            // Return normally if type includes only one error
            if (!link.$.type.includes("|")) {
                errBuffer.push(...output);
                continue;
            }

            // Split type into multiple errors
            const splitType = link.$.type.split("|");

            // Add new error for each type
            output = output.flatMap((err) => {
                return splitType.map((type) => {
                    return {
                        ...err,
                        type,
                    };
                });
            });

            await dbClient.insert(Err).values(output);
        }

        await dbClient.insert(Err).values(errBuffer);
    } catch (e: any) {
        console.log(chalk.red("Error occured at"), data.$);
        throw e;
    }
};

const populateMetadata = async () => {
    console.log(chalk.blue("Populating metadata"));

    // Bibl meta
    console.log(chalk.blue(" Populating bibl meta"));
    await setBiblMeta("FirstLang");
    await setBiblMeta("TaskSetting");
    await setBiblMeta("ProficSlv");
    await setBiblMeta("ProgramType");
    await setBiblMeta("InputType");
    console.log(chalk.green(" Done populating bibl meta"));
    await generateErrMeta();
    await generateWordClassMeta();
    await generateCorpusSizeMeta();

    console.log(chalk.green("Done populating metadata"));
};

const setBiblMeta = async (col: keyof BiblInsert) => {
    const counts = await getBiblCounts(col);
    await dbClient.insert(CountMeta).values({
        name: col,
        origCounts: JSON.stringify(counts.origCounts),
        origWithErrCounts: JSON.stringify(counts.origCountsWithErrors),
        corrCounts: JSON.stringify(counts.corrCounts),
        corrWithErrCounts: JSON.stringify(counts.corrCountsWithErrors),
    });
};

const getBiblCounts = async (col: keyof BiblInsert) => {
    console.log(chalk.blue("   Getting bibl counts for"), col);
    const origCounts = await getOrigCounts(col);
    const origCountsWithErrors = await getOrigCountsWithErrors(col);
    const corrCounts = await getCorrCounts(col);
    const corrCountsWithErrors = await getCorrCountsWithErrors(col);
    console.log(chalk.green("   Done getting bibl counts for"), col);

    return {
        origCounts,
        origCountsWithErrors,
        corrCounts,
        corrCountsWithErrors,
    };
};

const getOrigCounts = async (col: keyof BiblInsert) => {
    const query = `
        SELECT b."${col}", COUNT(DISTINCT(w.id)) as count
        FROM "Bibl" as b
            INNER JOIN "Word" as w ON w."biblId" = b.id AND w.type = 'ORIG'
        GROUP BY b."${col}"
        ORDER BY count DESC;
    `;

    return await dbClient.execute(sql.raw(query));
};

const getOrigCountsWithErrors = async (col: keyof BiblInsert) => {
    const query = `
        SELECT b."${col}", COUNT(DISTINCT(w.id)) as count
        FROM "Bibl" as b
            INNER JOIN "Word" as w ON w."biblId" = b."id" AND w.type = 'ORIG'
            INNER JOIN "Err" as e ON w.id = e."origWordId" AND NOT e.type = 'ID'
        GROUP BY b."${col}"
        ORDER BY count DESC;    
    `;
    return await dbClient.execute(sql.raw(query));
};

const getCorrCounts = async (col: keyof BiblInsert) => {
    const query = `
        SELECT b."${col}", COUNT(DISTINCT(w.id)) as count
        FROM "Bibl" as b
            INNER JOIN "Word" as w ON w."biblId" = b.id AND w.type = 'CORR'
        GROUP BY b."${col}"
        ORDER BY count DESC;      
    `;
    return await dbClient.execute(sql.raw(query));
};

const getCorrCountsWithErrors = async (col: keyof BiblInsert) => {
    const query = `
        SELECT b."${col}", COUNT(DISTINCT(w.id)) as count
        FROM "Bibl" as b
            INNER JOIN "Word" as w ON w."biblId" = b.id AND w.type = 'CORR'
            INNER JOIN "Err" as e ON e."corrWordId" = w.id AND NOT e.type = 'ID'
        GROUP BY b."${col}"
        ORDER BY count DESC;    
    `;
    return await dbClient.execute(sql.raw(query));
};

const generateErrMeta = async () => {
    console.log(chalk.blue("   Getting error counts"));
    const origCounts = await getOrigErrCounts();
    const corrCounts = await getCorrErrCounts();
    console.log(chalk.green("   Done getting error counts"));

    await dbClient.insert(CountMeta).values({
        name: "errs",
        origCounts: JSON.stringify(origCounts),
        corrCounts: JSON.stringify(corrCounts),
    });
};

const getOrigErrCounts = async () => {
    const query = `
        SELECT e.type, COUNT(e.id)::int as count
        FROM "Err" as e
        WHERE e."origWordId" IS NOT NULL AND NOT e.type = 'ID'
        GROUP BY e.type
        ORDER BY count DESC;
    `;
    return await dbClient.execute(sql.raw(query));
};

const getCorrErrCounts = async () => {
    const query = `
        SELECT e.type, COUNT(e.id)::int as count
        FROM "Err" as e
        WHERE e."corrWordId" IS NOT NULL AND NOT e.type = 'ID'
        GROUP BY e.type
        ORDER BY count DESC;  
    `;
    return await dbClient.execute(sql.raw(query));
};

const generateWordClassMeta = async () => {
    console.log(chalk.blue("   Getting word class counts"));
    const origCounts = await getWordClassTotalWordCount("ORIG");
    const origCountsWithErrors = await getWordClassWithErrorsCount("ORIG");
    const corrCounts = await getWordClassTotalWordCount("CORR");
    const corrCountsWithErrors = await getWordClassWithErrorsCount("CORR");
    console.log(chalk.green("   Done getting word class counts"));

    await dbClient.insert(CountMeta).values({
        name: "wordClass",
        origCounts: JSON.stringify(origCounts),
        origWithErrCounts: JSON.stringify(origCountsWithErrors),
        corrCounts: JSON.stringify(corrCounts),
        corrWithErrCounts: JSON.stringify(corrCountsWithErrors),
    });
};

const getWordClassTotalWordCount = async (searchSource: TextSource) => {
    // language=text - disable sql inspection warning
    const group = sql`substring("Word"."ana", 5, 1)`.as("wordClass");
    const countBy = count(Word.id);
    return dbClient
        .select({ wordClass: group, count: count(Word.id) })
        .from(Word)
        .where(eq(Word.type, searchSource))
        .groupBy(group)
        .orderBy(desc(countBy));
};

const getWordClassWithErrorsCount = async (searchSource: TextSource) => {
    // language=text - disable sql inspection warning
    const group = sql`substring("Word"."ana", 5, 1)`.as("wordClass");
    const countBy = count(Word.id);
    return dbClient
        .select({ wordClass: group, count: countBy })
        .from(Word)
        .innerJoin(
            Err,
            and(eq(Word.id, Err[searchSource === "ORIG" ? "origWordId" : "corrWordId"]), not(eq(Err.type, "ID"))),
        )
        .where(eq(Word.type, searchSource))
        .groupBy(group)
        .orderBy(desc(countBy));
};

const generateCorpusSizeMeta = async () => {
    console.log(chalk.blue("   Getting corpus size"));
    const origSize = await getCorpusSize("ORIG");
    const origErrSize = await getCorpusWithErrorsSize("ORIG");
    const corrSize = await getCorpusSize("CORR");
    const corrErrSize = await getCorpusWithErrorsSize("CORR");
    console.log(chalk.green("   Done getting corpus size"));

    await dbClient.insert(CountMeta).values({
        name: "corpusSize",
        origCounts: String(origSize),
        origWithErrCounts: String(origErrSize),
        corrCounts: String(corrSize),
        corrWithErrCounts: String(corrErrSize),
    });
};

const getCorpusSize = async (type: TextSource) => {
    const result = await dbClient
        .select({ count: count(Word.id) })
        .from(Word)
        .where(eq(Word.type, type));
    return result.at(0)?.count ?? -1;
};

const getCorpusWithErrorsSize = async (type: TextSource) => {
    const result = await dbClient
        .select({ count: countDistinct(Word.id) })
        .from(Word)
        .innerJoin(Err, and(eq(Word.id, Err[type === "ORIG" ? "origWordId" : "corrWordId"]), not(eq(Err.type, "ID"))))
        .where(eq(Word.type, type));
    return result.at(0)?.count ?? -1;
};

async function main() {
    const databaseUrl = process.env.KOST_DATABASE_URL;
    if (!databaseUrl) {
        console.error(chalk.red("KOST_DATABASE_URL not set"));
        return;
    }

    const dbName = databaseUrl.slice(databaseUrl.lastIndexOf("/") + 1);
    const databaseUrlNoDb = databaseUrl.slice(0, databaseUrl.lastIndexOf("/"));
    const migrationClient = postgres(databaseUrlNoDb, { max: 1 });
    const dbMigrationClient = drizzle(migrationClient);

    console.log(chalk.magenta(`Dropping database ${dbName}`));
    await dbMigrationClient.execute(sql.raw(`DROP DATABASE IF EXISTS "${dbName}"`));
    console.log(chalk.green("Done dropping database"));

    console.log(chalk.magenta("Creating database"));
    await dbMigrationClient.execute(sql.raw(`CREATE DATABASE "${dbName}"`));
    console.log(chalk.green("Done creating database"));

    await migrationClient.end();

    console.log(chalk.magenta("Running migrations"));
    await migrate(dbClient, { migrationsFolder: "./drizzle/migrations" });
    console.log(chalk.green("Done running migrations"));

    const tags = ["note", "p", "pc", "s", "w", "seg", "link"];

    console.time("Took");
    await parseFile(origFile, "div", tags, (data) => origDataHandler(data, "ORIG"));
    await parseFile(corrFile, "div", tags, (data) => origDataHandler(data, "CORR"));
    await parseFile(errFile, "linkGrp", ["linkGrp", "link"], errDataHandler);
    await populateMetadata();
    console.timeEnd("Took");

    await queryClient.end();
}

main().then();
