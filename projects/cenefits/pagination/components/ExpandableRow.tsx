import React from 'react';
import styled from 'styled-components';
import { Table } from 'antd';

import { Row, Column, PaginationResources } from '../models/paginationModel';

interface ExpandableRowProps {
    rowData: Row;
    columns: Array<Column<PaginationResources>>;
}

const Title = styled.span`
    font-weight: bold;
`;

const title = 'title';
const value = 'value';

export const ExpandableRow: React.SFC<ExpandableRowProps> = ({ rowData, columns }) => {
    const filtredColumns = columns.slice(1).filter(({ key }) => !key.includes('id'));

    const expandableData = filtredColumns.map(row => ({
        key: row.key,
        title: row.title,
        value: rowData[row.key],
    }));

    const expandableColumns = [
        { dataIndex: title, key: title, render: (text: string) => <Title>{text}</Title> },
        { dataIndex: value, key: value },
    ];

    return (
        <Table
            showHeader={false}
            pagination={false}
            columns={expandableColumns}
            dataSource={expandableData}
        />
    );
};
