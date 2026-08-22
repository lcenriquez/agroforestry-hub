import { useSyncExternalStore } from 'react';

import { Switch } from '@chakra-ui/react';
import { Moon, Sun } from '@phosphor-icons/react';

import { useColorMode } from '../ui/color-mode';

const subscribeNever = () => () => {};

// On the static export, the OS color scheme can already resolve to "dark" on
// the very first client render (before hydration finishes adopting the
// build-time "light" markup), and the underlying Ark UI switch machine then
// keeps its internal checked state stuck at the build-time value forever.
// useSyncExternalStore forces the first client render to match the server
// (false) and only flips to true on the next, hydration-safe render, which
// is enough for the switch to pick up the (by-then correct) `checked` prop.
function useMounted() {
	return useSyncExternalStore(
		subscribeNever,
		() => true,
		() => false
	);
}

const ThemeSwitch = () => {
	const { colorMode, toggleColorMode } = useColorMode();
	const isDark = colorMode === 'dark';
	const mounted = useMounted();

	return (
		<Switch.Root colorPalette="whiteAlpha" size="lg" checked={mounted && isDark} onCheckedChange={toggleColorMode}>
			<Switch.HiddenInput />
			<Switch.Control>
				<Switch.Thumb>
					<Switch.ThumbIndicator fallback={<Sun color="#e9c46a" size={12} weight="fill" />}>
						<Moon color="#292E1E" size={12} weight="fill" />
					</Switch.ThumbIndicator>
				</Switch.Thumb>
			</Switch.Control>
		</Switch.Root>
	);
};

export default ThemeSwitch;
