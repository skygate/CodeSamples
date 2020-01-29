import * as React from 'react';
import { Table } from 'antd';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { TableRowSelection } from 'antd/lib/table';

import { defaultPagination, breakpointsValues } from 'variables';
import { FormHeader } from 'src/features/create/styled';

import {
    PaginationResources,
    Row,
    Column,
    PaginationView,
    PaginationSuccessCallback,
    RequestParams,
} from '../models/paginationModel';
import { getPaginationState, getPaginationFetchingStatus } from '../selectors/paginationSelectors';
import { paginationRequest, clearPagination } from '../actions/paginationActions';
import { PaginationStateObject } from '../reducers/paginationReducer';
import { ExpandableRow } from './ExpandableRow';

interface PaginatedTableProps extends PaginationSuccessCallback {
    data: Row[];
    columns: Array<Column<PaginationResources>>;
    view: PaginationView;
    emptyText?: string;
    header?: string;
    requestParams?: RequestParams;
    size?: 'default' | 'middle' | 'small';
    rowSelection?: TableRowSelection<PaginationResources>;
    hideHeader?: boolean;
}

interface PaginatedTableStateProps {
    pagination: PaginationStateObject;
    isFetching: boolean;
}

interface PaginatedTableDispatchProps {
    paginationRequest: typeof paginationRequest;
    clearPagination: typeof clearPagination;
}

type Props = PaginatedTableProps & PaginatedTableStateProps & PaginatedTableDispatchProps;

interface PaginatedTableState {
    windowWidth: number;
}

class PaginatedTableComponent extends React.Component<Props, PaginatedTableState> {
    public state: PaginatedTableState = {
        windowWidth: 500,
    };

    public componentDidMount(): void {
        this.changePage(defaultPagination.firstPage);
        this.updateWindowWidth();
        window.addEventListener('resize', this.updateWindowWidth);
    }

    private changePage(page: number): void {
        const { pagination, paginationSuccessCallback, view, requestParams } = this.props;

        this.props.paginationRequest({
            pagination: { ...pagination, current: page },
            paginationSuccessCallback,
            view,
            requestParams,
        });
    }

    private handleChange = ({ current }: PaginationStateObject) => this.changePage(current);

    public componentWillUnmount = () => {
        this.props.clearPagination({
            paginationSuccessCallback: this.props.paginationSuccessCallback,
        });

        window.removeEventListener('resize', this.updateWindowWidth);
    };

    private updateWindowWidth = () => {
        this.setState({ windowWidth: window.innerWidth });
    };

    public render(): JSX.Element {
        const {
            data,
            columns,
            header,
            pagination,
            isFetching,
            size,
            rowSelection,
            hideHeader,
            emptyText = 'No data found',
        } = this.props;

        const isMobile = this.state.windowWidth < breakpointsValues.medium;
        const lastColumn = columns[columns.length - 1];
        const mobileColumns =
            lastColumn.key.includes('id') && columns.length > 1
                ? [columns[0], lastColumn]
                : [columns[0]];
        const expandableRowsNumber = columns.length - mobileColumns.length;
        const displayExpandableRow = isMobile && expandableRowsNumber;

        return (
            <>
                {header && <FormHeader>{header}</FormHeader>}
                <Table
                    dataSource={data}
                    columns={isMobile ? mobileColumns : columns}
                    rowKey={({ id }) => id.toString()}
                    locale={{ emptyText }}
                    pagination={pagination}
                    loading={isFetching}
                    onChange={this.handleChange}
                    size={size}
                    rowSelection={rowSelection}
                    showHeader={!hideHeader}
                    expandedRowRender={
                        displayExpandableRow
                            ? rowData => <ExpandableRow rowData={rowData} columns={columns} />
                            : undefined
                    }
                />
            </>
        );
    }
}

const mapStateToProps = createSelector(
    getPaginationState,
    getPaginationFetchingStatus,
    (pagination, isFetching): PaginatedTableStateProps => ({
        pagination,
        isFetching,
    }),
);

export const PaginatedTable = connect(
    mapStateToProps,
    {
        paginationRequest,
        clearPagination,
    },
)(PaginatedTableComponent);
