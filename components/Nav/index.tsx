import { Flex, Link, Text } from '@chakra-ui/react';

import ThemeSwitch from '../Elements/ThemeSwitch';
import { useColorModeValue } from '../ui/color-mode';
import AuthDetails from './AuthDetails';

export default function Nav() {
	return (
		<Flex
			bg={useColorModeValue('white', 'gray.800')}
			color={useColorModeValue('gray.600', 'white')}
			minH="60px"
			py={{ base: 2 }}
			px={{ base: 4 }}
			borderBottom="1px"
			borderStyle="solid"
			borderColor={useColorModeValue('gray.200', 'gray.900')}
			align="center"
		>
			<Flex flex={1} justify="start">
				<Link href="/">
					<Text fontFamily="heading" fontWeight="bold" color={useColorModeValue('gray.800', 'white')}>
						SAF Hub
					</Text>
				</Link>
			</Flex>

			<Flex justify="flex-end" align="center" gap={6}>
				<ThemeSwitch />
				<AuthDetails />
			</Flex>
		</Flex>
	);
}
