import FilterableList, { FilterableListProps } from "@/design-system/filterable-list/FilterableList";

export default async function AsyncFilterableList(
    props: FilterableListProps & { asyncFilterItems: Promise<FilterableListProps["filterItems"]> },
) {
    const filterItems = await props.asyncFilterItems;
    return <FilterableList filterItems={filterItems} showRel={props.showRel} {...props} />;
}
