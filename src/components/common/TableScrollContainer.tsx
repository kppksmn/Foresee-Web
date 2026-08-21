import React from 'react';

interface TableScrollContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const TableScrollContainer: React.FC<TableScrollContainerProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`overflow-x-auto w-full ${className}`}>
      {children}
    </div>
  );
};
