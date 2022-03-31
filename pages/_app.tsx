import { ChakraProvider } from '@chakra-ui/react';
import { AuthUserProvider } from '../contexts/AuthContext';
import theme from '../styles/theme';
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <AuthUserProvider>
        <Component {...pageProps} />
      </AuthUserProvider>
    </ChakraProvider> 
  );
}

export default MyApp
