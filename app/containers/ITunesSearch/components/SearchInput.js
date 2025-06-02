import React from 'react';
import PropTypes from 'prop-types';
import { OutlinedInput, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import inputStyles from '../styles/Input.css';

/**
 * Search input component with clear and search buttons
 * @param {Object} props - Component props
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Input change handler
 * @param {Function} props.onClear - Clear button click handler
 * @param {Function} props.onSearch - Search button click handler
 * @param {boolean} props.loading - Loading state
 */
const SearchInput = ({ value, onChange, onClear, onSearch, loading }) => {
  return (
    <OutlinedInput
      className={inputStyles.searchInput}
      placeholder="Search for tracks..."
      onChange={onChange}
      value={value}
      fullWidth
      endAdornment={
        <InputAdornment position="end">
          {value && (
            <IconButton className={inputStyles.iconButton} onClick={onClear} size="small" aria-label="Clear search">
              <ClearIcon />
            </IconButton>
          )}
          <IconButton
            className={inputStyles.iconButton}
            onClick={onSearch}
            disabled={loading}
            aria-label="Search tracks"
          >
            {loading ? (
              <div className={inputStyles.loaderContainer}>
                <CircularProgress size={20} sx={{ color: '#ffffff' }} />
              </div>
            ) : (
              <SearchIcon />
            )}
          </IconButton>
        </InputAdornment>
      }
    />
  );
};

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
};

export default SearchInput;
