import CheckBoxIcon from "@/assets/icons/CheckBoxIcon";
import CheckedBoxIcon from "@/assets/icons/CheckedBoxIcon";
import { clsx } from "clsx";

interface FilterableListHeaderProps {
    title?: string;
    showSelectAll?: boolean;
    isChecked?: boolean;
    onCheckClick?: () => void;
    hasCategories?: boolean;
}

export default function FilterableListHeader({
    title,
    showSelectAll,
    isChecked = false,
    onCheckClick,
    hasCategories = false,
}: FilterableListHeaderProps) {
    const checkboxClasses = clsx("fill-grey", hasCategories ? "px-1 py-0.5" : "mr-4");

    return (
        <div className="px-4 py-5 border-t-thin border-static-border flex justify-between items-center">
            <h4 className="body-2-title text-grey">{title}</h4>
            {showSelectAll && (
                <button className={checkboxClasses} onClick={onCheckClick}>
                    <span className="w-4 h-4 block shrink-0">{isChecked ? <CheckedBoxIcon /> : <CheckBoxIcon />}</span>
                </button>
            )}
        </div>
    );
}
