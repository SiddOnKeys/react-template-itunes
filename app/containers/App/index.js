/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React, { useEffect, useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Router } from 'react-router';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { CssBaseline, Container, Box } from '@mui/material';
import { ThemeProvider as MUIThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles';
import { Global } from '@emotion/react';
import styled from '@emotion/styled';
import { routeConfig } from '@app/routeConfig';
import globalStyles from '@app/global-styles';
import { ScrollToTop } from '@components/ScrollToTop';
import { For } from '@components/For';
import { If } from '@app/components/If';
import ConnectedLanguageProvider from '@containers/LanguageProvider';
import ErrorBoundary from '@app/components/ErrorBoundary/index';
import { translationMessages } from '@utils/i18n';
import history from '@utils/history';
import { SCREEN_BREAK_POINTS } from '@utils/constants';
import configureStore from '@app/configureStore';

const TRANSPARENT_VIOLET_BG = 'rgba(30, 27, 75, 0.5)';

const BlurredBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgb(107 29 163 / 17%) 0%, rgb(70 7 127 / 40%) 100%);
  backdrop-filter: blur(10px);
  z-index: -1;
`;

const StyledContainer = styled(Container)`
  min-height: 100vh;
  position: relative;
  z-index: 1;
  padding: 0 !important;
  padding-bottom: 80px !important; /* Add space for the playback bar */
`;

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2D1B69', // Bright violet
      light: '#A855F7',
      dark: '#7E22CE'
    },
    secondary: {
      main: '#2D1B69', // Dark violet
      light: '#3730A3',
      dark: '#1E1B4B'
    },
    background: {
      default: '#0F172A', // Dark blue-gray
      paper: TRANSPARENT_VIOLET_BG // Semi-transparent dark violet
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1'
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: TRANSPARENT_VIOLET_BG,
          backdropFilter: 'blur(8px)'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: TRANSPARENT_VIOLET_BG,
          backdropFilter: 'blur(8px)'
        }
      }
    }
  },
  breakpoints: {
    values: SCREEN_BREAK_POINTS
  }
});

/**
 * App component that sets up the application with routing, theme, and language support.
 * It also handles redirect logic based on the query parameters in the URL.
 *
 * @date 01/03/2024 - 14:47:28
 *
 * @returns {JSX.Element} The App component with the application setup.
 */
export function App() {
  const [store, setStore] = useState(null);
  const [persistor, setPersistor] = useState(null);

  const { location } = history;
  useEffect(() => {
    if (location.search.includes('?redirect_uri=')) {
      const routeToReplace = new URLSearchParams(location.search).get('redirect_uri');
      history.replace(routeToReplace);
    }
    const { store: s, persistor: p } = configureStore({}, history);
    setStore(s);
    setPersistor(p);
  }, []);

  // Convert routeConfig to array for safer iteration
  const routes = Object.entries(routeConfig).map(([key, route]) => ({
    key,
    ...route
  }));

  return (
    <If condition={!!persistor} otherwise={<div>LOADING</div>}>
      <PersistGate loading={null} persistor={persistor}>
        <Router history={history}>
          <ScrollToTop>
            <ErrorBoundary>
              <Provider store={store}>
                <ConnectedLanguageProvider messages={translationMessages}>
                  <StyledEngineProvider injectFirst>
                    <MUIThemeProvider theme={theme}>
                      <CssBaseline />
                      <Global styles={globalStyles} />
                      <Box sx={{ position: 'relative', minHeight: '100vh' }}>
                        <BlurredBackground />
                        <StyledContainer maxWidth={false} disableGutters>
                          <For
                            ParentComponent={(props) => <Switch {...props} />}
                            of={routes}
                            renderItem={(route, index) => {
                              const Component = route.component;
                              return (
                                <Route
                                  exact={route.exact}
                                  key={route.key}
                                  path={route.route}
                                  render={(props) => {
                                    const updatedProps = {
                                      ...props,
                                      ...route.props
                                    };
                                    return <Component {...updatedProps} />;
                                  }}
                                />
                              );
                            }}
                          />
                        </StyledContainer>
                      </Box>
                    </MUIThemeProvider>
                  </StyledEngineProvider>
                </ConnectedLanguageProvider>
              </Provider>
            </ErrorBoundary>
          </ScrollToTop>
        </Router>
      </PersistGate>
    </If>
  );
}

App.propTypes = {
  location: PropTypes.object,
  history: PropTypes.object
};

export default App;
