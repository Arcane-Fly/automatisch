import PropTypes from 'prop-types';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { ThemeProvider as BaseThemeProvider } from '@mui/material/styles';
import clone from 'lodash/clone';
import set from 'lodash/set';
import * as React from 'react';

import useAutomatischInfo from 'hooks/useAutomatischInfo';
import useAutomatischConfig from 'hooks/useAutomatischConfig';
import { defaultTheme, mationTheme } from 'styles/theme';

const overrideIfGiven = (theme, key, value) => {
  if (value) {
    set(theme, key, value);
  }
};

const customizeTheme = (theme, config) => {
  // `clone` is needed so that the new theme reference triggers re-render
  const shallowDefaultTheme = clone(theme);

  overrideIfGiven(
    shallowDefaultTheme,
    'palette.primary.main',
    config.palettePrimaryMain,
  );

  overrideIfGiven(
    shallowDefaultTheme,
    'palette.primary.light',
    config.palettePrimaryLight,
  );

  overrideIfGiven(
    shallowDefaultTheme,
    'palette.primary.dark',
    config.palettePrimaryDark,
  );

  overrideIfGiven(
    shallowDefaultTheme,
    'palette.footer.main',
    config.footerBackgroundColor,
  );

  overrideIfGiven(
    shallowDefaultTheme,
    'palette.footer.text',
    config.footerTextColor,
  );

  return shallowDefaultTheme;
};

const ThemeProvider = ({ children, ...props }) => {
  const {
    data: automatischInfo,
    isPending: isAutomatischInfoPending,
    isError: infoError,
    refetch: refetchInfo,
  } = useAutomatischInfo();
  const isMation = automatischInfo?.data?.isMation;
  const {
    data: configData,
    isLoading: configLoading,
    isError: configError,
    refetch: refetchConfig,
  } = useAutomatischConfig();
  const config = configData?.data;

  const customTheme = React.useMemo(() => {
    const installationTheme = isMation ? mationTheme : defaultTheme;

    if (configLoading || isAutomatischInfoPending) return installationTheme;

    const customTheme = customizeTheme(installationTheme, config || {});

    return customTheme;
  }, [configLoading, config, isMation, isAutomatischInfoPending]);

  if (isAutomatischInfoPending || configLoading) {
    return (
      <BaseThemeProvider theme={customTheme} {...props}>
        <CssBaseline />
        <Box
          component="main"
          role="status"
          aria-label="Connecting to Automatisch"
          sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <CircularProgress aria-hidden="true" />
        </Box>
      </BaseThemeProvider>
    );
  }

  return (
    <BaseThemeProvider theme={customTheme} {...props}>
      <CssBaseline />
      {infoError || configError ? (
        <Box
          component="main"
          role="alert"
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            p: 3,
            textAlign: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Unable to connect to Automatisch
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 480 }}>
            The application server is unavailable. Start the backend and try again.
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              if (infoError) refetchInfo();
              if (configError) refetchConfig();
            }}
          >
            Try again
          </Button>
        </Box>
      ) : (
        children
      )}
    </BaseThemeProvider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeProvider;
