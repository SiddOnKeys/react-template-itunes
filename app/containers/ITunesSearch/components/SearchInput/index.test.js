import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import SearchInput from './index';

describe('<SearchInput />', () => {
  const mockProps = {
    value: '',
    onChange: jest.fn(),
    onClear: jest.fn(),
    onSearch: jest.fn(),
    loading: false
  };

  it('should render correctly', () => {
    const { container } = render(<SearchInput {...mockProps} />);
    expect(container).toMatchSnapshot();
  });

  it('should call onChange when input value changes', () => {
    render(<SearchInput {...mockProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(mockProps.onChange).toHaveBeenCalled();
  });

  it('should call onClear when clear button is clicked', () => {
    render(<SearchInput {...mockProps} value="test" />);
    const clearButton = screen.getByTestId('clear-button');
    fireEvent.click(clearButton);
    expect(mockProps.onClear).toHaveBeenCalled();
  });

  it('should call onSearch when search button is clicked', () => {
    render(<SearchInput {...mockProps} value="test" />);
    const searchButton = screen.getByTestId('search-button');
    fireEvent.click(searchButton);
    expect(mockProps.onSearch).toHaveBeenCalled();
  });

  it('should show loading indicator when loading prop is true', () => {
    render(<SearchInput {...mockProps} loading={true} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should not show clear button when value is empty', () => {
    render(<SearchInput {...mockProps} />);
    expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument();
  });
});
