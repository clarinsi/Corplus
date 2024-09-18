import ChevronRightIcon from "@/assets/icons/ChevronRightIcon";

interface FilterableListFooterProps {
    isOpen: boolean;
    onClick: () => void;
}

export default function FilterableListFooter({ isOpen, onClick }: FilterableListFooterProps) {
    return (
        <button
            className="px-4 py-1.5 transition-all duration-200 hover:bg-secondary w-full flex gap-2 items-center text-grey"
            onClick={onClick}
        >
            <span className={`w-4 h-4 transition-all duration-200 ${isOpen ? "rotate-90" : ""}`}>
                <ChevronRightIcon />
            </span>
            <span className="callout">Več</span>
        </button>
    );
}
