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

// No useColorModeValue helper here on purpose: on the static export, when
// the OS already prefers dark on first load, Emotion never gets a chance to
// insert the "dark" class rule (it only saw "light" at build time), so a
// value resolved through such a hook stays stuck on its light variant. Use
// Chakra's `_dark={{ ... }}` style prop instead — it's pure CSS driven by
// the `.dark` class on <html>, so it doesn't depend on a client re-render.
