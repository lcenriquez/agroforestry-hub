import Link from 'next/link';

import { Avatar, Button, Menu, Portal } from '@chakra-ui/react';

import { useAuth } from '../../contexts/AuthContext';

export default function AuthDetails() {
	const { authUser } = useAuth();

	return <>{authUser ? <Authed /> : <NoAuth />}</>;
}

function NoAuth() {
	return (
		<>
			<Button asChild fontSize="sm" fontWeight={400} variant="plain">
				<Link href="/signin">Iniciar sesión</Link>
			</Button>
			<Button
				asChild
				display={{ base: 'none', md: 'inline-flex' }}
				fontSize="sm"
				fontWeight={600}
				color="white"
				bg="pink.400"
				_hover={{
					bg: 'pink.300'
				}}
			>
				<Link href="/signup">Registrarse</Link>
			</Button>
		</>
	);
}

function Authed() {
	const { authUser, signOut } = useAuth();

	return (
		<Menu.Root>
			<Menu.Trigger asChild>
				<Button rounded="full" variant="plain" cursor="pointer" minW={0}>
					<Avatar.Root size="sm">
						<Avatar.Fallback name={authUser?.email ?? undefined} />
					</Avatar.Root>
				</Button>
			</Menu.Trigger>
			<Portal>
				<Menu.Positioner>
					<Menu.Content>
						<Menu.Item value="profile">Mi perfil</Menu.Item>
						<Menu.Item value="settings">Configuración</Menu.Item>
						<Menu.Separator />
						<Menu.Item value="signout" onClick={signOut}>
							Cerrar sesión
						</Menu.Item>
					</Menu.Content>
				</Menu.Positioner>
			</Portal>
		</Menu.Root>
	);
}
