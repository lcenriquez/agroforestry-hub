import { useRouter } from 'next/router';

import { Box, Flex, Text } from '@chakra-ui/react';

import { useColorModeValue } from '../../components/ui/color-mode';

// Documentation for custom functionality: https://firebase.google.com/docs/auth/custom-email-handler

export default function AccountAction() {
	const router = useRouter();
	const mode = typeof router.query.mode === 'string' ? router.query.mode : '';

	return (
		<Flex minH="100vh" align="center" justify="center" bg={useColorModeValue('gray.50', 'gray.800')}>
			<Box justifyContent="center" rounded="lg" bg={useColorModeValue('white', 'gray.700')} boxShadow="lg" p={8}>
				<Text>{mode}</Text>
			</Box>
		</Flex>
	);
}
