import React from 'react';
import { render, act } from '@testing-library/react';
import { MemoryRouter, Route, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { ScrollToTop } from '../index';

describe('<ScrollToTop />', () => {
  const mockScrollTo = jest.fn();

  beforeEach(() => {
    // Mock window.scrollTo
    global.window.scrollTo = mockScrollTo;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should scroll to top when pathname changes', () => {
    const history = createMemoryHistory();

    render(
      <Router history={history}>
        <ScrollToTop>
          <div>Test content</div>
        </ScrollToTop>
      </Router>
    );

    // Initial render should trigger scroll
    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    mockScrollTo.mockClear();

    // Change location
    act(() => {
      history.push('/new-path');
    });

    // Should trigger scroll again
    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('should render children', () => {
    const { container } = render(
      <MemoryRouter>
        <ScrollToTop>
          <div>Test content</div>
        </ScrollToTop>
      </MemoryRouter>
    );

    expect(container.textContent).toBe('Test content');
  });

  it('should not scroll when pathname remains the same', () => {
    const history = createMemoryHistory();

    render(
      <Router history={history}>
        <ScrollToTop>
          <div>Test content</div>
        </ScrollToTop>
      </Router>
    );

    mockScrollTo.mockClear();

    // Push the same path
    act(() => {
      history.push(history.location.pathname);
    });

    // Should not trigger scroll again
    expect(mockScrollTo).not.toHaveBeenCalled();
  });
});
