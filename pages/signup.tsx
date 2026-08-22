import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Alert, Box, Button, Field, Flex, Heading, HStack, Input, InputGroup, Link, Stack, Text } from '@chakra-ui/react';
import { Eye, EyeOff } from 'lucide-react';

import { useColorModeValue } from '../components/ui/color-mode';
import { useAuth } from '../contexts/AuthContext';

export default function SignupCard() {
	const router = useRouter();
	const [input, setInput] = useState({ email: '', password: '', firstName: '', lastName: '' });
	const [showPassword, setShowPassword] = useState(false);
	const { authUser, loading, error, signUp } = useAuth();

	useEffect(() => {
		if (!loading && authUser && !error) router.push('/');
	}, [authUser, loading, error, router]);

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		signUp(input.email, input.password, `${input.firstName} ${input.lastName}`);
	}

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		setInput({ ...input, [event.target.name]: event.target.value });
	}

	return (
		<Flex minH="100vh" align="center" justify="center" bg={useColorModeValue('gray.50', 'gray.800')}>
			<Stack gap={5} mx="auto" maxW="lg" py={12} px={6}>
				<Stack align="center">
					<Heading fontSize="4xl" textAlign="center">
						Regístrate
					</Heading>
					<Text>
						o{' '}
						<Link color="blue.400" alignSelf="center" href="/">
							volver al inicio
						</Link>
					</Text>
				</Stack>
				<Box rounded="lg" bg={useColorModeValue('white', 'gray.700')} boxShadow="lg" p={8}>
					<form onSubmit={handleSubmit}>
						<Stack gap={4}>
							<HStack>
								<Box>
									<Field.Root required>
										<Field.Label>Nombre</Field.Label>
										<Input type="text" name="firstName" required onChange={handleChange} />
									</Field.Root>
								</Box>
								<Box>
									<Field.Root required>
										<Field.Label>Apellido</Field.Label>
										<Input type="text" name="lastName" required onChange={handleChange} />
									</Field.Root>
								</Box>
							</HStack>
							<Field.Root required>
								<Field.Label>Email</Field.Label>
								<Input type="email" name="email" required onChange={handleChange} />
							</Field.Root>
							<Field.Root required>
								<Field.Label>Contraseña</Field.Label>
								<InputGroup
									endElement={
										<Button variant="ghost" onClick={() => setShowPassword(current => !current)}>
											{showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
										</Button>
									}
								>
									<Input type={showPassword ? 'text' : 'password'} name="password" required onChange={handleChange} />
								</InputGroup>
							</Field.Root>
							<Stack gap={10} pt={2}>
								{error && (
									<Alert.Root status="error">
										<Alert.Indicator />
										<Alert.Title>{error.message}</Alert.Title>
									</Alert.Root>
								)}
								<Button
									type="submit"
									loadingText="Procesando"
									size="lg"
									bg="blue.400"
									color="white"
									_hover={{
										bg: 'blue.500'
									}}
									loading={loading}
								>
									Registrarme
								</Button>
							</Stack>
							<Stack pt={6}>
								<Text textAlign="center">
									¿Ya tienes cuenta?{' '}
									<Link color="blue.400" href="/signin">
										Inicia sesión
									</Link>
								</Text>
							</Stack>
						</Stack>
					</form>
				</Box>
			</Stack>
		</Flex>
	);
}
