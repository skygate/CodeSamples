import { inject, injectable } from 'inversify';

import { defaultAutocompleteSize, defaultPagination } from 'variables';
import { generatePaginationEndpoint, generateAutocompleteEndpoint } from 'src/config/appConfig';
import { HttpService } from 'src/common/services/HttpService';
import { SERVICE } from 'src/config/identifiers';
import { FilterData } from 'src/common/helpers/url';
import { generateAutocompleteFilterProperties } from 'src/common/helpers/utils';

import {
    PaginationRequest,
    PaginationResponse,
    AutocompleteResponse,
    AutocompleteRequest,
    InitialValueDataRequest,
    AutocompleteData,
} from '../models/paginationModel';

@injectable()
export class PaginationService {
    constructor(@inject(SERVICE.Http) private readonly http: HttpService) {}

    public paginate({
        view,
        pagination: { current, pageSize },
        requestParams,
        filters,
    }: PaginationRequest): Promise<PaginationResponse> {
        const paginationPageSize = pageSize || defaultPagination.pageSize;

        const path = generatePaginationEndpoint(view, requestParams);
        const offset = paginationPageSize * (current - 1);

        const pagination = { limit: paginationPageSize, offset };

        return path
            ? this.http.GET(path, pagination, filters)
            : Promise.reject(new Error('Paginated request failed: no path specified'));
    }

    public autocomplete({
        autocompleteField,
        searchTerm,
        searchParams,
    }: AutocompleteRequest): Promise<AutocompleteResponse> {
        const path = generateAutocompleteEndpoint(autocompleteField);

        const pagination = { limit: defaultAutocompleteSize, offset: 0 };

        const filters = generateAutocompleteFilterProperties({
            autocompleteField,
            searchTerm,
            searchParams,
        });

        return path
            ? this.http.GET(path, pagination, filters as FilterData)
            : Promise.reject(new Error('Autocomplete request failed: no path specified'));
    }

    public getAutocompleteInitialValue({
        autocompleteField,
        id,
    }: InitialValueDataRequest): Promise<AutocompleteData> {
        const path = generateAutocompleteEndpoint(autocompleteField);

        return path
            ? this.http.GET(`${path}${id}/`)
            : Promise.reject(new Error('Fetching initial value failed: no path specified'));
    }
}
