import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Alert, Box, Button, Field, Flex, Heading, Input, Link, Stack, Text } from '@chakra-ui/react';

import { useAuth } from '../contexts/AuthContext';

export default function SignIn() {
	const router = useRouter();
	const [input, setInput] = useState({ email: '', password: '' });
	const { authUser, loading, error, signIn } = useAuth();

	useEffect(() => {
		if (!loading && authUser && !error) router.push('/');
	}, [authUser, loading, error, router]);

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		signIn(input.email, input.password);
	}

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		setInput({ ...input, [event.target.name]: event.target.value });
	}

	return (
		<Flex minH="100vh" align="center" justify="center" bg="gray.50" _dark={{ bg: 'gray.800' }}>
			<Stack gap={5} mx="auto" w="sm" py={12} px={6}>
				<Stack align="center">
					<Heading fontSize="4xl">Inicia sesión</Heading>
					<Text>
						o{' '}
						<Link color="blue.400" alignSelf="center" href="/">
							volver al inicio
						</Link>
					</Text>
				</Stack>
				<Box rounded="lg" bg="white" _dark={{ bg: 'gray.700' }} boxShadow="lg" p={8}>
					<form onSubmit={handleSubmit}>
						<Stack gap={4}>
							<Field.Root>
								<Field.Label>Correo electrónico</Field.Label>
								<Input type="email" name="email" required onChange={handleChange} />
							</Field.Root>
							<Field.Root>
								<Field.Label>Contraseña</Field.Label>
								<Input type="password" name="password" required onChange={handleChange} />
							</Field.Root>
							<Stack gap={5}>
								{error && (
									<Alert.Root status="error">
										<Alert.Indicator />
										<Alert.Title>{error.message}</Alert.Title>
									</Alert.Root>
								)}
								<Link color="blue.400">¿Olvidaste tu contraseña?</Link>
								<Button
									type="submit"
									bg="blue.400"
									color="white"
									_hover={{
										bg: 'blue.500'
									}}
									loading={loading}
								>
									Ingresar
								</Button>
							</Stack>
						</Stack>
					</form>
				</Box>
			</Stack>
		</Flex>
	);
}
