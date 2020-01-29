import { AppAction } from 'src/common/actions/appAction';
import { defaultPagination } from 'variables';

import { FilterData } from 'src/common/helpers/url';

import * as actions from '../actions/paginationActions';
import { PaginationView, AutocompleteField, AutocompleteData } from '../models/paginationModel';
import { getNewFilters } from '../helpers/getNewFilters';

export interface PaginationStateObject {
    total: number;
    current: number;
    pageSize: number;
}

export interface PaginationFilters {
    paginatedView: PaginationView;
    values: FilterData;
    path?: string;
}

export interface AutocompleteResults {
    autocompleteField: AutocompleteField;
    results: AutocompleteData[];
}

export interface PaginationState {
    pagination: PaginationStateObject;
    isFetching: boolean;
    filters: PaginationFilters[];
    autocomplete: AutocompleteResults[];
    fetchingAutocompleteStatuses: AutocompleteField[];
    initialValues: AutocompleteData[];
    fetchingInitialValues: AutocompleteField[];
}

const paginationInitialState = {
    pagination: {
        total: 0,
        current: 1,
        pageSize: defaultPagination.pageSize,
    },
    isFetching: false,
    filters: [],
    autocomplete: [],
    initialValues: [],
    fetchingAutocompleteStatuses: [],
    fetchingInitialValues: [],
};

export const paginationReducer = (
    state: PaginationState = paginationInitialState,
    action: AppAction,
) => {
    switch (action.type) {
        case actions.PAGINATION_REQUESTED:
            return {
                ...state,
                isFetching: true,
            };

        case actions.PAGINATION_SUCCEED: {
            const {
                count,
                pagination: { current },
            } = action.payload!;

            return {
                ...state,
                pagination: {
                    ...state.pagination,
                    total: count,
                    current,
                },
                isFetching: false,
            };
        }

        case actions.PAGINATION_FAILED:
            return {
                ...state,
                isFetching: false,
            };

        case actions.SAVE_FILTERS: {
            return {
                ...state,
                filters: getNewFilters(state.filters, action.payload!),
            };
        }

        case actions.CLEAR_PAGINATION:
            return {
                ...state,
                pagination: paginationInitialState.pagination,
            };

        case actions.CLEAR_FILTERS:
            return {
                ...state,
                filters: state.filters.filter(
                    ({ paginatedView }) => paginatedView !== action.payload,
                ),
            };

        case actions.CLEAR_ALL_FILTERS:
            return {
                ...state,
                filters: [],
            };

        case actions.AUTOCOMPLETE_REQUESTED: {
            const { autocompleteField } = action.payload!;

            if (!state.fetchingAutocompleteStatuses.includes(autocompleteField)) {
                return {
                    ...state,
                    fetchingAutocompleteStatuses: [
                        ...state.fetchingAutocompleteStatuses,
                        autocompleteField,
                    ],
                };
            }

            return {
                ...state,
            };
        }

        case actions.AUTOCOMPLETE_SUCCEED: {
            const { autocompleteField } = action.payload!;

            const autocomplete = state.autocomplete.filter(
                results => results.autocompleteField !== autocompleteField,
            );

            const fetchingAutocompleteStatuses = state.fetchingAutocompleteStatuses.filter(
                field => field !== autocompleteField,
            );

            return {
                ...state,
                autocomplete: [...autocomplete, action.payload],
                fetchingAutocompleteStatuses,
            };
        }

        case actions.AUTOCOMPLETE_FAILED: {
            const fetchingAutocompleteStatuses = state.fetchingAutocompleteStatuses.filter(
                field => field !== action.payload!.autocompleteField,
            );

            return {
                ...state,
                fetchingAutocompleteStatuses,
            };
        }

        case actions.GET_INITIAL_VALUE_DATA_REQUESTED: {
            const { autocompleteField } = action.payload!;

            if (!state.fetchingInitialValues.includes(autocompleteField)) {
                return {
                    ...state,
                    fetchingInitialValues: [...state.fetchingInitialValues, autocompleteField],
                };
            }

            return {
                ...state,
            };
        }

        case actions.GET_INITIAL_VALUE_DATA_SUCCEED: {
            const { autocompleteField } = action.payload!;

            const fetchingInitialValues = state.fetchingInitialValues.filter(
                field => field !== autocompleteField,
            );

            const initialValues = state.initialValues.filter(
                results => results.autocompleteField !== autocompleteField,
            );

            return {
                ...state,
                fetchingInitialValues,
                initialValues: [...initialValues, action.payload],
            };
        }

        case actions.GET_INITIAL_VALUE_DATA_FAILED: {
            const fetchingInitialValues = state.fetchingInitialValues.filter(
                field => field !== action.payload!.autocompleteField,
            );

            return {
                ...state,
                fetchingInitialValues,
            };
        }

        case actions.CLEAR_INITIAL_VALUE_DATA:
            return {
                ...state,
                initialValues: state.initialValues.filter(
                    ({ autocompleteField }) => autocompleteField !== action.payload,
                ),
            };

        default:
            return state;
    }
};
