import React, { useState } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { Search, X } from 'lucide-react';

export interface CustomSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  options: CustomSelectOption[];
  openUpward?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium';
  className?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export const CustomScrollSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  placeholder = '',
  options,
  disabled = false,
  size = 'small',
  className = '',
  searchable = false,
  searchPlaceholder = 'ค้นหา...'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  const filteredOptions = React.useMemo(() => {
    const list = options.filter((opt) => !placeholder || opt.value !== '');
    if (!searchable || !searchTerm.trim()) return list;
    const term = searchTerm.trim().toLowerCase();
    return list.filter((opt) => opt.label.toLowerCase().includes(term));
  }, [options, placeholder, searchable, searchTerm]);

  return (
    <FormControl fullWidth size={size} disabled={disabled} className={className}>
      <Select
        value={value ?? ''}
        onChange={handleChange}
        open={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => {
          setIsOpen(false);
          setSearchTerm('');
        }}
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
          autoFocus: !searchable,
          slotProps: {
            paper: {
              sx: {
                maxHeight: 280,
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
                  '&.Mui-disabled': {
                    opacity: 0.6,
                    color: '#94a3b8',
                    backgroundColor: '#f8fafc',
                    cursor: 'not-allowed',
                  },
                },
              },
            },
          },
        }}
      >
        {searchable && (
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              backgroundColor: '#ffffff',
              padding: '6px 8px',
              borderBottom: '1px solid #e2e8f0',
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                padding: '4px 8px',
              }}
            >
              <Search size={14} color="#64748b" style={{ flexShrink: 0 }} />
              <input
                type="text"
                autoFocus
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '12px',
                  marginLeft: '6px',
                  width: '100%',
                  color: '#1e293b',
                  fontFamily: 'inherit',
                }}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={13} color="#94a3b8" />
                </button>
              )}
            </div>
          </div>
        )}

        {placeholder && !searchTerm ? (
          <MenuItem value="" sx={{ color: '#94a3b8' }}>
            <em>{placeholder}</em>
          </MenuItem>
        ) : null}

        {filteredOptions.length === 0 ? (
          <MenuItem disabled sx={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', justifyContent: 'center' }}>
            ไม่พบข้อมูลที่ค้นหา
          </MenuItem>
        ) : (
          filteredOptions.map((opt, idx) => (
            <MenuItem key={`${opt.value}-${idx}`} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );
};
