import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
	theme: {
		breakpoints: {
			sm: '320px',
			md: '768px',
			lg: '960px',
			xl: '1200px'
		}
	}
});

const system = createSystem(defaultConfig, config);

export default system;
