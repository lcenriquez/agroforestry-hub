import { ThemeProvider, useTheme } from 'next-themes';

import type { ThemeProviderProps } from 'next-themes';

export type ColorModeProviderProps = ThemeProviderProps;

export function ColorModeProvider(props: ColorModeProviderProps) {
	return <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange {...props} />;
}

export type ColorMode = 'light' | 'dark';

export interface UseColorModeReturn {
	colorMode: ColorMode;
	setColorMode: (colorMode: ColorMode) => void;
	toggleColorMode: () => void;
}

export function useColorMode(): UseColorModeReturn {
	const { resolvedTheme, setTheme, forcedTheme } = useTheme();
	const colorMode = (forcedTheme || resolvedTheme || 'light') as ColorMode;

	const toggleColorMode = () => {
		setTheme(colorMode === 'dark' ? 'light' : 'dark');
	};

	return {
		colorMode,
		setColorMode: setTheme as (colorMode: ColorMode) => void,
		toggleColorMode
	};
}

export function useColorModeValue<T>(light: T, dark: T): T {
	const { colorMode } = useColorMode();
	return colorMode === 'dark' ? dark : light;
}
