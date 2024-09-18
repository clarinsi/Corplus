type PaginatedResponse<T> = {
    data: T;
    meta: {
        itemsPerPage: number;
        totalItems: number;
        totalPages: number;
        currentPage: number;
    };
    links: {
        first: string;
        previous: string;
        current: string;
        next: string;
        last: string;
    };
};
