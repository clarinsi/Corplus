import { Paragraph } from "@/db/schema/paragraph.schema";
import { Sentence } from "@/db/schema/sentence.schema";
import { Word } from "@/db/schema/word.schema";
import { relations } from "drizzle-orm";
import { index, pgTable, text } from "drizzle-orm/pg-core";

export const Bibl = pgTable(
    "Bibl",
    {
        id: text("id").primaryKey(),
        Topic: text("Topic"),
        Instruction: text("Instruction"),
        AcademicYear: text("AcademicYear"),
        TaskSetting: text("TaskSetting"),
        CreationDate: text("CreationDate"),
        ProficSlv: text("ProficSlv"),
        ProgramType: text("ProgramType"),
        ProgramSubtype: text("ProgramSubtype"),
        Teacher: text("Teacher"),
        InputType: text("InputType"),
        Grade: text("Grade"),
        Author: text("Author"),
        Sex: text("Sex"),
        YearOfBirth: text("YearOfBirth"),
        EmploymentStatus: text("EmploymentStatus"),
        CompletedEducation: text("CompletedEducation"),
        CurrentSchool: text("CurrentSchool"),
        StudyCycle: text("StudyCycle"),
        StudyYear: text("StudyYear"),
        Country: text("Country"),
        FirstLang: text("FirstLang"),
        OtherLang: text("OtherLang"),
        ExpSlv: text("ExpSlv"),
        LocSlvLearning: text("LocSlvLearning"),
        DurSlvLearning: text("DurSlvLearning"),
        SloveneTextbooks: text("SloveneTextbooks"),
        LifeSlovenia: text("LifeSlovenia"),
    },
    (bibl) => {
        return {
            taskSettingIndex: index("bibl_" + bibl.TaskSetting.name + "_idx").on(bibl.TaskSetting),
            proficSlvIndex: index("bibl_" + bibl.ProficSlv.name + "_idx").on(bibl.ProficSlv),
            programTypeIndex: index("bibl_" + bibl.ProgramType.name + "_idx").on(bibl.ProgramType),
            inputTypeIndex: index("bibl_" + bibl.InputType.name + "_idx").on(bibl.InputType),
            firstLangIndex: index("bibl_" + bibl.FirstLang.name + "_idx").on(bibl.FirstLang),
        };
    },
);

export const BiblRelations = relations(Bibl, ({ many }) => ({
    paragraphs: many(Paragraph),
    sentences: many(Sentence),
    words: many(Word),
}));

export type BiblInsert = typeof Bibl.$inferInsert;
export type BiblSelect = typeof Bibl.$inferSelect;
