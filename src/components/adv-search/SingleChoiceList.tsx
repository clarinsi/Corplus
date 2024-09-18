"use client";

import RadioButtonCheckedIcon from "@/assets/icons/RadioButtonCheckedIcon";
import RadioButtonIcon from "@/assets/icons/RadioButtonIcon";

export interface SingleChoiceFilter {
    label: string;
    value: string;
}

interface SingleChoiceListProps {
    filters: SingleChoiceFilter[];
    selectedValue: string;
    changeHandler?: (value: string) => void;
}

export default function SingleChoiceList({ filters, selectedValue, changeHandler }: SingleChoiceListProps) {
    return (
        <div className="flex flex-col gap-4">
            {filters.map((f) => (
                <SingleChoiceListItem
                    key={f.value}
                    label={f.label}
                    value={f.value}
                    isActive={selectedValue === f.value}
                    onClick={changeHandler}
                />
            ))}
        </div>
    );
}

interface SingleChoiceListItemProps {
    label: string;
    value: string;
    isActive: boolean;
    onClick?: (value: string) => void;
}

function SingleChoiceListItem({ label, value, isActive, onClick }: SingleChoiceListItemProps) {
    return (
        <button type="button" className="body-2 flex items-center gap-2" onClick={() => onClick && onClick(value)}>
            <span className="w-4 h-4 text-grey">{isActive ? <RadioButtonCheckedIcon /> : <RadioButtonIcon />}</span>
            {label}
        </button>
    );
}
