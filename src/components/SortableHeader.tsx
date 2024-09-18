import CaretSortDownIcon from "@/assets/icons/CaretSortDownIcon";
import CaretSortUpIcon from "@/assets/icons/CaretSortUpIcon";
import NeutralSortIcon from "@/assets/icons/NeutralSortIcon";
import { clsx } from "clsx";

interface SortableHeaderProps {
    text: string;
    sortBy: string;
    currentSortBy: string | undefined;
    currentSortAsc: boolean;
    showTrailing?: boolean;
    onSortClick?: (sortBy: string, sortAsc: boolean) => void;
    alignRight?: boolean;
}

export default function SortableHeader({
    text,
    sortBy,
    currentSortBy,
    currentSortAsc,
    showTrailing = true,
    onSortClick,
    alignRight = false,
}: SortableHeaderProps) {
    const iconClasses = clsx(
        "h-4 w-5",
        sortBy === currentSortBy && "fill-interactive",
        sortBy !== currentSortBy && "fill-grey group-hover:fill-interactive",
    );

    const textClasses = clsx(alignRight && "text-end w-full mr-2");

    const clickHandler = () => {
        if (!onSortClick) return;
        if (sortBy === currentSortBy) {
            onSortClick(sortBy, !currentSortAsc);
        } else {
            onSortClick(sortBy, false);
        }
    };

    const sortIcon =
        sortBy === currentSortBy ? currentSortAsc ? <CaretSortUpIcon /> : <CaretSortDownIcon /> : <NeutralSortIcon />;

    return (
        <button
            className="px-2 py-3 body-2-title flex items-center justify-between bg-surface-static-secondary group"
            onClick={clickHandler}
            type="button"
        >
            <span className={textClasses}>{text}</span>
            {showTrailing && <span className={iconClasses}>{sortIcon}</span>}
        </button>
    );
}
