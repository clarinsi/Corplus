import { useTranslations } from "next-intl";
import { ParagraphData } from "@/data/paragraph";

interface TabProps {
    data: ParagraphData;
}

export default function ParagraphMetadataTab({ data }: TabProps) {
    const tMeta = useTranslations("Metadata");

    return (
        <div className="px-4 flex gap-4 justify-between">
            <div className="bg-surface-static-secondary rounded-md p-4 grow flex flex-wrap gap-8">
                <MetaEntry title={tMeta("instruction")} value={data.bibl.Instruction} />
                <MetaEntry title={tMeta("textCode")} value={data.id.slice(0, -4)} />
                <MetaEntry title={tMeta("topic")} value={data.bibl.Topic} />
                <MetaEntry title={tMeta("creationDate")} value={data.bibl.CreationDate} />
                <MetaEntry title={tMeta("taskSetting")} value={data.bibl.TaskSetting} />
                <MetaEntry title={tMeta("proficSlv")} value={data.bibl.ProficSlv} />
                <MetaEntry title={tMeta("programType")} value={data.bibl.ProgramType} />
                <MetaEntry title={tMeta("inputType")} value={data.bibl.InputType} />
                <MetaEntry title={tMeta("firstLang")} value={data.bibl.FirstLang} />
                <MetaEntry title={tMeta("subProgram")} value={data.bibl.ProgramSubtype} />
                <MetaEntry title={tMeta("author")} value={data.bibl.Author} />
                <MetaEntry title={tMeta("sex")} value={data.bibl.Sex} />
                <MetaEntry title={tMeta("yearOfBirth")} value={data.bibl.YearOfBirth} />
                <MetaEntry title={tMeta("employmentStatus")} value={data.bibl.EmploymentStatus} />
                <MetaEntry title={tMeta("completedEducation")} value={data.bibl.CompletedEducation} />
                <MetaEntry title={tMeta("currentSchool")} value={data.bibl.CurrentSchool} />
                <MetaEntry title={tMeta("country")} value={data.bibl.Country} />
                <MetaEntry title={tMeta("otherLang")} value={data.bibl.OtherLang} />
            </div>
        </div>
    );
}

function MetaEntry({ title, value }: { title: string; value: string | null }) {
    if (value === null) return;
    return (
        <div className="flex flex-col gap-1">
            <h5 className="caption !font-light text-light-grey">{title}</h5>
            <span className="body-2 text-grey">{value || "/"}</span>
        </div>
    );
}
