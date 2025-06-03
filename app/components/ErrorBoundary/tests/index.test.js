import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../index';

// Mock the translate function
jest.mock('@app/utils', () => ({
  translate: (key) => key
}));

// Create a component that throws an error
const ThrowError = () => {
  throw new Error('Test error');
};

// Create a component that renders normally
const NormalComponent = () => <div>Normal component</div>;

describe('<ErrorBoundary />', () => {
  beforeEach(() => {
    // Prevent console.error from cluttering the test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal component')).toBeInTheDocument();
  });

  it('should render error message when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('something_went_wrong')).toBeInTheDocument();
  });

  it('should call componentDidCatch when an error occurs', () => {
    const spy = jest.spyOn(ErrorBoundary.prototype, 'componentDidCatch');

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should update state when an error occurs', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const instance = container.firstChild;
    expect(instance).toBeTruthy();
    expect(screen.getByText('something_went_wrong')).toBeInTheDocument();
  });
});
