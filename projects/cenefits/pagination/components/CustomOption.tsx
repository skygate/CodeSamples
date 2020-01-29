import React from 'react';

interface CustomOptionProps {
    organisation?: number;
    contract?: number;
}

export const CustomOption: React.SFC<CustomOptionProps> = ({ children, ...props }) => (
    <div {...props}>{children}</div>
);
