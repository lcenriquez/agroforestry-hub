import { Flex, HStack, Link, Text } from '@chakra-ui/react';

import Logo from '../Elements/Logo';
import ThemeSwitch from '../Elements/ThemeSwitch';
import AuthDetails from './AuthDetails';

export default function Nav() {
	return (
		<Flex
			bg="white"
			color="gray.600"
			minH="60px"
			py={{ base: 2 }}
			px={{ base: 4 }}
			borderBottom="1px"
			borderStyle="solid"
			borderColor="gray.200"
			_dark={{ bg: 'gray.800', color: 'white', borderColor: 'gray.900' }}
			align="center"
		>
			<Flex flex={1} justify="start">
				<Link href="/">
					<HStack gap={2}>
						<Logo size={28} />
						<Text fontFamily="heading" fontWeight="bold" color="gray.800" _dark={{ color: 'white' }}>
							SAF Hub
						</Text>
					</HStack>
				</Link>
			</Flex>

			<Flex justify="flex-end" align="center" gap={6}>
				<ThemeSwitch />
				<AuthDetails />
			</Flex>
		</Flex>
	);
}
