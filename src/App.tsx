import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import Layout from '@/Layout.tsx';
import { useMemo, useState } from 'react';

export default function App() {
  const [darkMode, setDarkMode] = useState(
    JSON.parse(localStorage.getItem('darkMode') || 'false'),
  );

  const toggleDarkMode = () => {
    setDarkMode((prev: boolean) => {
      localStorage.setItem('darkMode', JSON.stringify(!prev));
      return !prev;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
        },
      }),
    [darkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        Content
      </Layout>
    </ThemeProvider>
  );
}
