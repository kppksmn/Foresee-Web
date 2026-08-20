import React from 'react';
import {
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  options: { label: string; value: string }[];
  openUpward?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium';
  className?: string;
}

export const CustomScrollSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  placeholder = '',
  options,
  disabled = false,
  size = 'small',
  className = ''
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl fullWidth size={size} disabled={disabled} className={className}>
      <Select
        value={value ?? ''}
        onChange={handleChange}
        displayEmpty
        sx={{
          fontSize: '0.8125rem',
          backgroundColor: disabled ? '#f1f5f9' : '#f8fafc',
          borderRadius: '0.5rem',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e2e8f0',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#cbd5e1',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3b82f6',
            borderWidth: '1.5px',
          },
          '& .MuiSelect-select': {
            paddingTop: '8px',
            paddingBottom: '8px',
            paddingLeft: '12px',
            color: value ? '#1e293b' : '#94a3b8',
            fontWeight: value ? 500 : 400,
          },
        }}
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
                maxHeight: 240,
                borderRadius: '0.5rem',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                marginTop: '4px',
                '& .MuiMenuItem-root': {
                  fontSize: '0.8125rem',
                  padding: '8px 14px',
                  '&:hover': {
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#bfdbfe',
                    },
                  },
                },
              },
            },
          },
        }}
      >
        {placeholder ? (
          <MenuItem value="" sx={{ color: '#94a3b8' }}>
            <em>{placeholder}</em>
          </MenuItem>
        ) : null}
        {options
          .filter((opt) => !placeholder || opt.value !== '')
          .map((opt, idx) => (
            <MenuItem key={`${opt.value}-${idx}`} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};
