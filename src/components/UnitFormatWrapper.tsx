"use client";

import RuleIcon from "@/assets/icons/RuleIcon";
import SummaryIcon from "@/assets/icons/SummaryIcon";
import { SHOW_RELATIVE } from "@/constants";
import ContentSwitcher from "@/design-system/ContentSwitcher";
import { usePathname, useRouter } from "@/navigation";
import { parseRawFilters } from "@/util/parsing.util";
import { createUrl } from "@/util/util";

interface UnitFormatWrapperProps {
    searchParams: Record<string, string>;
}

export default function UnitFormatWrapper({ searchParams }: UnitFormatWrapperProps) {
    const router = useRouter();
    const path = usePathname();
    const parsedFilters = parseRawFilters(searchParams);

    const handleContentSwitcherClick = (name: string) => {
        const newSearchParams = new URLSearchParams(searchParams);

        if (name === "abs") newSearchParams.delete(SHOW_RELATIVE);
        else if (name === "rel") newSearchParams.set(SHOW_RELATIVE, "true");

        router.replace(createUrl(path, newSearchParams));
    };

    return (
        <div className="flex items-center px-4 py-2 border-r-thin border-static-border">
            <ContentSwitcher
                name="abs"
                position="left"
                isActive={!parsedFilters.showRelative}
                icon={<SummaryIcon />}
                onClick={handleContentSwitcherClick}
            />
            <ContentSwitcher
                name="rel"
                position="right"
                isActive={parsedFilters.showRelative}
                icon={<RuleIcon />}
                onClick={handleContentSwitcherClick}
            />
        </div>
    );
}
