import { switchMap, pluck, map, debounceTime, mergeMap } from 'rxjs/operators';
import { ofType, combineEpics } from 'redux-observable';

import { AppEpic } from 'src/common/epics/appEpic';
import { AppState } from 'src/common/appState';

import * as actions from '../actions/paginationActions';
import { PaginationService } from '../services/paginationService';
import {
    PaginationRequest,
    PaginationSuccess,
    PaginationView,
    AutocompleteRequest,
    InitialValueDataRequest,
    PaginationSuccessCallback,
} from '../models/paginationModel';

export const paginationEpicFactory = (paginationService: PaginationService): AppEpic => {
    const paginationEpic: AppEpic = (action$, store) =>
        action$.pipe(
            ofType(actions.PAGINATION_REQUESTED),
            pluck('payload'),
            mergeMap((request: PaginationRequest) => {
                const state: AppState = store.getState();

                const filters = state.pagination.filters.find(({ paginatedView }) => {
                    // temporary solution to use one filter set to 2 paginated views
                    const isContractsFilter = paginatedView === PaginationView.Contracts;
                    const isMyContractsView = request.view === PaginationView.MyContracts;

                    return (
                        (isContractsFilter && isMyContractsView) || paginatedView === request.view
                    );
                });

                return paginationService
                    .paginate({ ...request, filters: filters && filters.values })
                    .then(response => actions.paginationSuccess({ ...response, ...request }))
                    .catch(actions.paginationFailed);
            }),
        );

    const paginationSuccessEpic: AppEpic = action$ =>
        action$.pipe(
            ofType(actions.PAGINATION_SUCCEED),
            pluck('payload'),
            map(({ paginationSuccessCallback, results }: PaginationSuccess) => {
                return results
                    ? paginationSuccessCallback(results)
                    : actions.paginationFailed({ message: 'Pagination error' });
            }),
        );

    const clearPaginationEpic: AppEpic = action$ =>
        action$.pipe(
            ofType(actions.CLEAR_PAGINATION),
            pluck('payload'),
            map(({ paginationSuccessCallback }: PaginationSuccessCallback) =>
                paginationSuccessCallback([]),
            ),
        );

    const autocompleteEpic: AppEpic = action$ =>
        action$.pipe(
            ofType(actions.AUTOCOMPLETE_REQUESTED),
            debounceTime(300),
            pluck('payload'),
            switchMap(({ searchTerm, searchParams, ...request }: AutocompleteRequest) =>
                paginationService
                    .autocomplete({ searchTerm, searchParams, ...request })
                    .then(response => actions.autocompleteSuccess({ ...response, ...request }))
                    .catch(({ message }) =>
                        actions.autocompleteFailed({
                            ...request,
                            message,
                        }),
                    ),
            ),
        );

    const getAutocompleteInitialValueEpic: AppEpic = action$ =>
        action$.pipe(
            ofType(actions.GET_INITIAL_VALUE_DATA_REQUESTED),
            pluck('payload'),
            mergeMap(({ autocompleteField, ...request }: InitialValueDataRequest) =>
                paginationService
                    .getAutocompleteInitialValue({ autocompleteField, ...request })
                    .then(initialValueData =>
                        actions.getInitialValueSuccess({
                            autocompleteField,
                            ...initialValueData,
                        }),
                    )
                    .catch(({ message }) =>
                        actions.getInitialValueFailed({
                            autocompleteField,
                            message,
                        }),
                    ),
            ),
        );

    return combineEpics(
        paginationEpic,
        paginationSuccessEpic,
        clearPaginationEpic,
        autocompleteEpic,
        getAutocompleteInitialValueEpic,
    );
};
