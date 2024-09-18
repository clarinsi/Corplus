import { useMemo, useState } from "react";
import CheckBoxIcon from "@/assets/icons/CheckBoxIcon";
import CheckedBoxIcon from "@/assets/icons/CheckedBoxIcon";
import ChevronDownIcon from "@/assets/icons/ChevronDownIcon";
import ChevronUpIcon from "@/assets/icons/ChevronUpIcon";
import { FilterItem } from "@/components/filters/ErrorsDropdownFilter";
import MenuListItem from "@/design-system/MenuListItem";
import { getCategoryItemsCodes } from "@/util/filter.util";

interface MenuListCategoryProps {
    category: FilterItem;
    selectedItems: string[];
    onItemClick?: (name: string | string[], isCategoryChecked: boolean) => void;
}

export function MenuListCategory({ category, selectedItems, onItemClick }: MenuListCategoryProps) {
    const [isOpen, setIsOpen] = useState(false);
    const categoryItemsCodes = useMemo(() => getCategoryItemsCodes(category), [category]);

    const openHandler = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const categorySelectHandler = () => {
        if (!onItemClick) return;
        onItemClick(categoryItemsCodes, isCategorySelected);
    };

    const isCategorySelected = useMemo(() => {
        return categoryItemsCodes.every((code) => selectedItems.includes(code));
    }, [categoryItemsCodes, selectedItems]);

    return (
        <>
            <MenuListItem
                value={category.label}
                icon={<CheckBoxIcon />}
                activeIcon={<CheckedBoxIcon />}
                trailingIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                isActive={isCategorySelected}
                onTrailingIconClick={openHandler}
                onClick={categorySelectHandler}
            >
                {category.label}
            </MenuListItem>
            {isOpen && (
                <ul className="pl-8 bg-white">
                    {category.children?.map((item) => {
                        if (item.children?.length ?? 0 > 0)
                            return (
                                <MenuListCategory
                                    key={`${category.label}-${item.label}`}
                                    category={item}
                                    selectedItems={selectedItems}
                                    onItemClick={onItemClick}
                                />
                            );

                        if (!item.value) {
                            console.error("MenuListCategory: item.value is undefined", item);
                            return;
                        }

                        return (
                            <MenuListItem
                                key={item.label}
                                value={item.value}
                                icon={<CheckBoxIcon />}
                                activeIcon={<CheckedBoxIcon />}
                                isActive={selectedItems.includes(item.value)}
                                onClick={() => onItemClick?.(item.value!, true)}
                            >
                                {item.label}
                            </MenuListItem>
                        );
                    })}
                </ul>
            )}
        </>
    );
}
