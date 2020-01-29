import { Action } from 'src/common/actions/appAction';

import {
    PaginationRequest,
    PaginationSuccess,
    PaginationView,
    AutocompleteRequest,
    AutocompleteSuccess,
    AutocompleteFailed,
    InitialValueDataRequest,
    InitialValueDataFailed,
    AutocompleteData,
    AutocompleteField,
    PaginationSuccessCallback,
} from '../models/paginationModel';
import { PaginationFilters } from '../reducers/paginationReducer';

export const PAGINATION_REQUESTED = 'PAGINATION_REQUESTED';
export type PaginationRequestAction = Action<typeof PAGINATION_REQUESTED, PaginationRequest>;
export const paginationRequest = (request: PaginationRequest): PaginationRequestAction => ({
    type: PAGINATION_REQUESTED,
    payload: request,
});

export const PAGINATION_SUCCEED = 'PAGINATION_SUCCEED';
export type PaginationSuccessAction = Action<typeof PAGINATION_SUCCEED, PaginationSuccess>;
export const paginationSuccess = (pagination: PaginationSuccess): PaginationSuccessAction => ({
    type: PAGINATION_SUCCEED,
    payload: pagination,
});

export const PAGINATION_FAILED = 'PAGINATION_FAILED';
export type PaginationFailureAction = Action<typeof PAGINATION_FAILED, { message: string }>;
export const paginationFailed = (payload: { message: string }): PaginationFailureAction => ({
    type: PAGINATION_FAILED,
    payload,
});

export const CLEAR_PAGINATION = 'CLEAR_PAGINATION';
export type ClearPaginationAction = Action<typeof CLEAR_PAGINATION, PaginationSuccessCallback>;
export const clearPagination = (success: PaginationSuccessCallback): ClearPaginationAction => ({
    type: CLEAR_PAGINATION,
    payload: success,
});

export const SAVE_FILTERS = 'SAVE_FILTERS';
export type SaveFilters = Action<typeof SAVE_FILTERS, PaginationFilters>;
export const saveFilters = (filters: PaginationFilters): SaveFilters => ({
    type: SAVE_FILTERS,
    payload: filters,
});

export const CLEAR_FILTERS = 'CLEAR_FILTERS';
export type ClearFilters = Action<typeof CLEAR_FILTERS, PaginationView>;
export const clearFilters = (paginatedView: PaginationView): ClearFilters => ({
    type: CLEAR_FILTERS,
    payload: paginatedView,
});

export const CLEAR_ALL_FILTERS = 'CLEAR_ALL_FILTERS';
export type ClearAllFilters = Action<typeof CLEAR_ALL_FILTERS, null>;
export const clearAllFilters = (): ClearAllFilters => ({
    type: CLEAR_ALL_FILTERS,
});

export const AUTOCOMPLETE_REQUESTED = 'AUTOCOMPLETE_REQUESTED';
export type AutocompleteRequestAction = Action<typeof AUTOCOMPLETE_REQUESTED, AutocompleteRequest>;
export const autocompleteRequest = (request: AutocompleteRequest): AutocompleteRequestAction => ({
    type: AUTOCOMPLETE_REQUESTED,
    payload: request,
});

export const AUTOCOMPLETE_SUCCEED = 'AUTOCOMPLETE_SUCCEED';
export type AutocompleteSuccessAction = Action<typeof AUTOCOMPLETE_SUCCEED, AutocompleteSuccess>;
export const autocompleteSuccess = (
    autocomplete: AutocompleteSuccess,
): AutocompleteSuccessAction => ({
    type: AUTOCOMPLETE_SUCCEED,
    payload: autocomplete,
});

export const AUTOCOMPLETE_FAILED = 'AUTOCOMPLETE_FAILED';
export type AutocompleteFailureAction = Action<typeof AUTOCOMPLETE_FAILED, AutocompleteFailed>;
export const autocompleteFailed = (failure: AutocompleteFailed): AutocompleteFailureAction => ({
    type: AUTOCOMPLETE_FAILED,
    payload: failure,
});

export const GET_INITIAL_VALUE_DATA_REQUESTED = 'GET_INITIAL_VALUE_DATA_REQUESTED';
export type getInitialValueRequestAction = Action<
    typeof GET_INITIAL_VALUE_DATA_REQUESTED,
    InitialValueDataRequest
>;
export const getInitialValueRequest = (
    request: InitialValueDataRequest,
): getInitialValueRequestAction => ({
    type: GET_INITIAL_VALUE_DATA_REQUESTED,
    payload: request,
});

export const GET_INITIAL_VALUE_DATA_SUCCEED = 'GET_INITIAL_VALUE_DATA_SUCCEED';
export type getInitialValueSuccessAction = Action<
    typeof GET_INITIAL_VALUE_DATA_SUCCEED,
    AutocompleteData
>;
export const getInitialValueSuccess = (
    autocompleteInitialValueData: AutocompleteData,
): getInitialValueSuccessAction => ({
    type: GET_INITIAL_VALUE_DATA_SUCCEED,
    payload: autocompleteInitialValueData,
});

export const GET_INITIAL_VALUE_DATA_FAILED = 'GET_INITIAL_VALUE_DATA_FAILED';
export type getInitialValueFailureAction = Action<
    typeof GET_INITIAL_VALUE_DATA_FAILED,
    InitialValueDataFailed
>;
export const getInitialValueFailed = (
    failure: InitialValueDataFailed,
): getInitialValueFailureAction => ({
    type: GET_INITIAL_VALUE_DATA_FAILED,
    payload: failure,
});

export const CLEAR_INITIAL_VALUE_DATA = 'CLEAR_INITIAL_VALUE_DATA';
export type ClearInitialValueData = Action<typeof CLEAR_INITIAL_VALUE_DATA, AutocompleteField>;
export const clearInitialValueData = (field: AutocompleteField): ClearInitialValueData => ({
    type: CLEAR_INITIAL_VALUE_DATA,
    payload: field,
});

export type PaginationActions =
    | PaginationRequestAction
    | PaginationSuccessAction
    | PaginationFailureAction
    | ClearPaginationAction
    | SaveFilters
    | ClearFilters
    | ClearAllFilters
    | AutocompleteRequestAction
    | AutocompleteSuccessAction
    | AutocompleteFailureAction
    | getInitialValueRequestAction
    | getInitialValueSuccessAction
    | getInitialValueFailureAction
    | ClearInitialValueData;
