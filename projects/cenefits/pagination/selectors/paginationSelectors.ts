import { AppState } from 'src/common/appState';

import { PaginationView, AutocompleteField } from '../models/paginationModel';
import { createSelector } from 'reselect';
import { getFilterId } from 'src/common/selectors/routeSelectors';
import { RouteComponentProps } from 'react-router';

export const getPaginationState = (state: AppState) => state.pagination.pagination;
export const getPaginationPageSize = (state: AppState) => state.pagination.pagination.pageSize;
export const getPaginationFetchingStatus = (state: AppState) => state.pagination.isFetching;
export const getPaginationFilters = <P>(state: AppState, _: RouteComponentProps<P>) =>
    state.pagination.filters;

export const getActiveFiltersCount = (state: AppState, paginatedView: PaginationView) => {
    const viewFilters = state.pagination.filters.find(
        filters => filters.paginatedView === paginatedView,
    );

    return viewFilters && Object.values(viewFilters.values).filter(val => val !== undefined).length;
};

export const getAutocompleteResults = (state: AppState, field: AutocompleteField) => {
    const autocomplete = state.pagination.autocomplete.find(
        ({ autocompleteField }) => autocompleteField === field,
    );

    return autocomplete ? autocomplete.results : [];
};

export const getAutocompleteFetchingStatus = (state: AppState, field: AutocompleteField) =>
    state.pagination.fetchingAutocompleteStatuses.includes(field);

export const getInitialValueData = (state: AppState, field: AutocompleteField) =>
    state.pagination.initialValues.find(initialValue => initialValue.autocompleteField === field);

export const getInitialValueFetchingStatus = (state: AppState, field: AutocompleteField) =>
    state.pagination.fetchingInitialValues.includes(field);

export const getFilterParams = (state: AppState, paginatedView: PaginationView) =>
    state.pagination.filters!.find(filters => filters.paginatedView === paginatedView);

export const getFilterFormInitialValues = createSelector(
    getFilterId,
    getPaginationFilters,
    (filterId, filters) => filters!.find(filter => filter.paginatedView === filterId),
);
