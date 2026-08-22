import { useRouter } from 'next/router';

import { Box, Flex, Text } from '@chakra-ui/react';

// Documentation for custom functionality: https://firebase.google.com/docs/auth/custom-email-handler

export default function AccountAction() {
	const router = useRouter();
	const mode = typeof router.query.mode === 'string' ? router.query.mode : '';

	return (
		<Flex minH="100vh" align="center" justify="center" bg="gray.50" _dark={{ bg: 'gray.800' }}>
			<Box justifyContent="center" rounded="lg" bg="white" _dark={{ bg: 'gray.700' }} boxShadow="lg" p={8}>
				<Text>{mode}</Text>
			</Box>
		</Flex>
	);
}
