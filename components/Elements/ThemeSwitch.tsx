import { Switch } from '@chakra-ui/react';
import { Moon, Sun } from '@phosphor-icons/react';

import { useColorMode } from '../ui/color-mode';

const ThemeSwitch = () => {
	const { colorMode, toggleColorMode } = useColorMode();
	const isDark = colorMode === 'dark';

	return (
		<Switch.Root colorPalette="whiteAlpha" size="lg" checked={isDark} onCheckedChange={toggleColorMode}>
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
