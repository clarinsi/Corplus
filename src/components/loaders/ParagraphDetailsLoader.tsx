import CloseIcon from "@/assets/icons/CloseIcon";
import IconButton from "@/design-system/button/IconButton";

export default function ParagraphDetailsLoader() {
    return (
        <div className="bg-white">
            <div className="flex justify-between items-center p-4 border-b border-static-border">
                <h4 className="text-surface-static-emphasised body-2-title">Korpusni podatki</h4>

                <IconButton bg="light" shape="square" hiearchy="ghost" size="xsmall">
                    <CloseIcon />
                </IconButton>
            </div>
            <div className="px-4 py-3 flex gap-1">
                <div className="bg-secondary animate-pulse rounded-3xl h-9 w-32" />
                <div className="bg-secondary animate-pulse rounded-3xl h-9 w-32" />
                <div className="bg-secondary animate-pulse rounded-3xl h-9 w-32" />
            </div>

            <div className="px-4 flex gap-4 justify-between">
                <div className="flex flex-col gap-4 grow">
                    <div className="bg-secondary animate-pulse rounded-md h-36 p-4"></div>
                    <div className="bg-secondary animate-pulse rounded-md h-36 p-4"></div>
                </div>

                <div className="flex flex-col gap-4 w-64">
                    <div className="bg-secondary animate-pulse rounded-md p-4 flex flex-col justify-between h-28" />
                    <div className="bg-secondary animate-pulse rounded-md px-4 grow flex gap-8" />
                </div>
            </div>
        </div>
    );
}
