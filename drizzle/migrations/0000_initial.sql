DO $$ BEGIN
 CREATE TYPE "public"."TextSource" AS ENUM('ORIG', 'CORR');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Bibl" (
	"id" text PRIMARY KEY NOT NULL,
	"Topic" text,
	"Instruction" text,
	"AcademicYear" text,
	"TaskSetting" text,
	"CreationDate" text,
	"ProficSlv" text,
	"ProgramType" text,
	"ProgramSubtype" text,
	"Teacher" text,
	"InputType" text,
	"Grade" text,
	"Author" text,
	"Sex" text,
	"YearOfBirth" text,
	"EmploymentStatus" text,
	"CompletedEducation" text,
	"CurrentSchool" text,
	"StudyCycle" text,
	"StudyYear" text,
	"Country" text,
	"FirstLang" text,
	"OtherLang" text,
	"ExpSlv" text,
	"LocSlvLearning" text,
	"DurSlvLearning" text,
	"SloveneTextbooks" text,
	"LifeSlovenia" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Err" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"origWordId" text,
	"corrWordId" text,
	"origSentenceId" text,
	"corrSentenceId" text,
	"origParagraphId" text,
	"corrParagraphId" text,
	"groupId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CountMeta" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"origCounts" text NOT NULL,
	"origWithErrCounts" text,
	"corrCounts" text NOT NULL,
	"corrWithErrCounts" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Paragraph" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "TextSource" NOT NULL,
	"biblId" text NOT NULL,
	"origParagraphId" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Sentence" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "TextSource" NOT NULL,
	"biblId" text NOT NULL,
	"paragraphId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Word" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "TextSource" NOT NULL,
	"ana" text NOT NULL,
	"lemma" text,
	"text" text NOT NULL,
	"prevContext" text,
	"nextContext" text,
	"biblId" text NOT NULL,
	"sentenceId" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Err" ADD CONSTRAINT "Err_origWordId_Word_id_fk" FOREIGN KEY ("origWordId") REFERENCES "public"."Word"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Err" ADD CONSTRAINT "Err_corrWordId_Word_id_fk" FOREIGN KEY ("corrWordId") REFERENCES "public"."Word"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Err" ADD CONSTRAINT "Err_origSentenceId_Sentence_id_fk" FOREIGN KEY ("origSentenceId") REFERENCES "public"."Sentence"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Err" ADD CONSTRAINT "Err_corrSentenceId_Sentence_id_fk" FOREIGN KEY ("corrSentenceId") REFERENCES "public"."Sentence"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Err" ADD CONSTRAINT "Err_origParagraphId_Paragraph_id_fk" FOREIGN KEY ("origParagraphId") REFERENCES "public"."Paragraph"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Err" ADD CONSTRAINT "Err_corrParagraphId_Paragraph_id_fk" FOREIGN KEY ("corrParagraphId") REFERENCES "public"."Paragraph"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Paragraph" ADD CONSTRAINT "Paragraph_biblId_Bibl_id_fk" FOREIGN KEY ("biblId") REFERENCES "public"."Bibl"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Paragraph" ADD CONSTRAINT "Paragraph_origParagraphId_Paragraph_id_fk" FOREIGN KEY ("origParagraphId") REFERENCES "public"."Paragraph"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Sentence" ADD CONSTRAINT "Sentence_biblId_Bibl_id_fk" FOREIGN KEY ("biblId") REFERENCES "public"."Bibl"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Sentence" ADD CONSTRAINT "Sentence_paragraphId_Paragraph_id_fk" FOREIGN KEY ("paragraphId") REFERENCES "public"."Paragraph"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Word" ADD CONSTRAINT "Word_prevContext_Word_id_fk" FOREIGN KEY ("prevContext") REFERENCES "public"."Word"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Word" ADD CONSTRAINT "Word_nextContext_Word_id_fk" FOREIGN KEY ("nextContext") REFERENCES "public"."Word"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Word" ADD CONSTRAINT "Word_biblId_Bibl_id_fk" FOREIGN KEY ("biblId") REFERENCES "public"."Bibl"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Word" ADD CONSTRAINT "Word_sentenceId_Sentence_id_fk" FOREIGN KEY ("sentenceId") REFERENCES "public"."Sentence"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bibl_TaskSetting_idx" ON "Bibl" USING btree ("TaskSetting");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bibl_ProficSlv_idx" ON "Bibl" USING btree ("ProficSlv");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bibl_ProgramType_idx" ON "Bibl" USING btree ("ProgramType");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bibl_InputType_idx" ON "Bibl" USING btree ("InputType");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bibl_FirstLang_idx" ON "Bibl" USING btree ("FirstLang");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "err_type_idx" ON "Err" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "err_origWordId_idx" ON "Err" USING btree ("origWordId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "err_corrWordId_idx" ON "Err" USING btree ("corrWordId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "err_origSentenceId_idx" ON "Err" USING btree ("origSentenceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "err_corrSentenceId_idx" ON "Err" USING btree ("corrSentenceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "err_origParagraphId_idx" ON "Err" USING btree ("origParagraphId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "err_corrParagraphId_idx" ON "Err" USING btree ("corrParagraphId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "err_type_origWordId_idx" ON "Err" USING btree ("type","origWordId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "err_type_corrWordId_idx" ON "Err" USING btree ("type","corrWordId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "paragraph_type_idx" ON "Paragraph" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "paragraph_biblId_idx" ON "Paragraph" USING btree ("biblId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "paragraph_origParagraphId_idx" ON "Paragraph" USING btree ("origParagraphId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sentence_type_idx" ON "Sentence" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sentence_biblId_idx" ON "Sentence" USING btree ("biblId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sentence_paragraphId_idx" ON "Sentence" USING btree ("paragraphId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "word_lemma_idx" ON "Word" USING btree ("lemma");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "word_text_idx" ON "Word" USING btree ("text");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "word_ana_idx" ON "Word" USING btree ("ana");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "word_type_idx" ON "Word" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "word_biblId_idx" ON "Word" USING btree ("biblId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "word_sentenceId_idx" ON "Word" USING btree ("sentenceId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "word_prevContext_idx" ON "Word" USING btree ("prevContext");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "word_nextContext_idx" ON "Word" USING btree ("nextContext");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "word_lemma_type_text_idx" ON "Word" USING btree ("lemma","type","text");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "word_type_lemma_id_idx" ON "Word" USING btree ("type","lemma","id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "word_type_lemma_idx" ON "Word" USING btree ("type","lemma");
