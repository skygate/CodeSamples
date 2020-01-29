import { CheckBenefit } from 'src/features/check/models/checkModel';
import { ContractBenefit, Benefit, SharedBenefit } from 'src/features/benefit/models/benefitModels';
import { UploadBenefit } from 'src/features/upload/models/uploadModels';
import { Organisation } from 'src/features/organisation/models/organisationModels';
import { Contract, Filters as ContractFilters } from 'src/features/contract/models/contractModels';
import { AppAction } from 'src/common/actions/appAction';
import { FilterData } from 'src/common/helpers/url';
import { Profile, User } from 'src/features/user/models/userModel';
import { EmployeeInvitation, OrganisationInvitation } from 'src/features/invite/models/inviteModel';

export type PaginationResources =
    | UploadBenefit
    | CheckBenefit
    | Contract
    | Benefit
    | SharedBenefit
    | ContractBenefit
    | Organisation
    | Profile
    | ContractFilters
    | EmployeeInvitation
    | OrganisationInvitation;

export enum PaginationView {
    UploadEvidence,
    ApprovedUploadEvidence,
    UploadScore,
    ApprovedUploadScores,
    CheckEvidence,
    CheckScores,
    ApprovedCheckEvidence,
    ApprovedCheckScores,
    DownloadContracts,
    DownloadBenefits,
    SharedBenefits,
    Contracts,
    MyContracts,
    ContractBenefits,
    AddOrganisation,
    EditOrganisations,
    EditEmployees,
    ContractCategories,
    Departments,
    Locations,
    BenefitCategories,
    AssignEmployees,
    OrganisationEmployees,
    SupplierEditContract,
    EmployeePendingInvitations,
    ExistingOrganisationPendingInvitations,
    NewOrganisationPendingInvitations,
}

export type Row = PaginationResources;

export interface Column<T = Row> {
    title: string | JSX.Element;
    key: string;
    render?(title: string, data: T): JSX.Element;
    width?: string | number;
    fixed?: boolean | 'left' | 'right';
}

export interface PaginationQueryParams {
    limit: number;
    offset: number;
}

export interface PaginationSuccessCallback {
    paginationSuccessCallback: (data: PaginationResources[]) => AppAction;
}

export interface PaginationParams {
    total?: number;
    current: number;
    pageSize?: number;
}

export interface PaginationRequest extends PaginationSuccessCallback {
    pagination: PaginationParams;
    view: PaginationView;
    requestParams?: RequestParams;
    filters?: FilterData;
}

interface PaginationResults {
    results: PaginationResources[];
}

export interface PaginationResponse extends PaginationResults {
    count: number;
    next: string;
    previous: string;
}

export type PaginationSuccess = PaginationRequest & PaginationResponse;

export interface PaginationFailure extends PaginationRequest {
    error: string;
}

export interface RequestParams {
    contractId?: number;
    organisationId?: number;
}

export interface Filters {
    [key: string]: string | number | boolean | undefined | PaginationParams;
}

export enum AutocompleteField {
    Location,
    Department,
    BenefitCategory,
    ContractCategory,
    ContractPortfolioFilter,

    ContractManager,
    Assessor,

    SupplierOrganisation,
    ContractSupplierOrganisation,
    DeliveryPartnerOrganisation,

    TenantOrganisation,
    ExecutiveOrganisation,

    Employee,
    ExecutiveSupplierUser,
    ExecutiveContractSupplierUser,
    ExecutiveDeliveryPartnerUser,

    Contract,
    SharedBenefit,

    MyContract,
    MyBenefit,
}

export interface AutocompleteProperties {
    name?: string;
    categoryName?: string;
    category?: number;
    title?: string;
    outcome?: string;
    fullname?: string;
    referenceNumber?: string;
    organisation?: number;
    user?: User;
    contract?: number;
    rootNodes?: string;
}

export interface AutocompleteData extends AutocompleteProperties {
    id: number;
    autocompleteField?: AutocompleteField;
}

export interface Field {
    autocompleteField: AutocompleteField;
}

export interface AutocompleteRequest extends Field {
    searchTerm: string;
    searchParams?: Filters;
}

export interface AutocompleteResponse {
    results: AutocompleteData[];
}

export type AutocompleteSuccess = Field & AutocompleteResponse;

export interface AutocompleteFailed extends Field {
    message: string;
}

export interface InitialValueDataRequest extends Field {
    id: number;
}

export interface InitialValueDataSuccess extends Field {
    initialValueData: AutocompleteData;
}

export interface InitialValueDataFailed extends Field {
    message: string;
}
