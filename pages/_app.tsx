import { ChakraProvider } from '@chakra-ui/react';

import { ColorModeProvider } from '../components/ui/color-mode';
import { AuthUserProvider } from '../contexts/AuthContext';
import system from '../styles/theme';

import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<ChakraProvider value={system}>
			<ColorModeProvider>
				<AuthUserProvider>
					<Component {...pageProps} />
				</AuthUserProvider>
			</ColorModeProvider>
		</ChakraProvider>
	);
}

export default MyApp;
