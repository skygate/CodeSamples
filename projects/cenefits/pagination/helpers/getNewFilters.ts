import { PaginationFilters } from '../reducers/paginationReducer';

export const getNewFilters = (filters: PaginationFilters[], filter: PaginationFilters) => {
    const oldFilter = filters.find(({ paginatedView }) => paginatedView === filter!.paginatedView);

    const newFilter = !oldFilter
        ? filter
        : { ...filter, values: { ...oldFilter.values, ...filter!.values } };

    return !oldFilter
        ? [...filters, newFilter]
        : filters.map(existingFilter =>
              existingFilter.paginatedView === filter!.paginatedView ? newFilter : existingFilter,
          );
};
