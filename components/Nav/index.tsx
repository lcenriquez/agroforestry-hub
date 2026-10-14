import NextLink from 'next/link';
import { useRouter } from 'next/router';

import { Flex, HStack, IconButton, Link, Menu, Portal, Text } from '@chakra-ui/react';
import { ListIcon } from '@phosphor-icons/react';

import Logo from '../Elements/Logo';
import ThemeSwitch from '../Elements/ThemeSwitch';
import AuthDetails from './AuthDetails';

const NAV_LINKS = [
	{ href: '/#catalogo', label: 'Especies', pathname: '/' },
	{ href: '/saf', label: '¿Qué es un SAF?', pathname: '/saf' },
	{ href: '/disenador', label: 'Diseñador', pathname: '/disenador' }
];

export default function Nav() {
	const router = useRouter();

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
			gap={4}
		>
			<Flex flex={1} justify="start" align="center" gap={8}>
				<Link asChild>
					<NextLink href="/">
						<HStack gap={2}>
							<Logo size={28} />
							<Text fontFamily="heading" fontWeight="bold" color="gray.800" _dark={{ color: 'white' }}>
								SAF Hub
							</Text>
						</HStack>
					</NextLink>
				</Link>

				<HStack as="nav" gap={6} display={{ base: 'none', lg: 'flex' }}>
					{NAV_LINKS.map(link => {
						const active = router.pathname === link.pathname;
						return (
							<Link
								key={link.href}
								asChild
								fontSize="sm"
								fontWeight={active ? 600 : 500}
								color={active ? 'green.700' : 'gray.600'}
								_dark={{ color: active ? 'green.300' : 'gray.200' }}
								_hover={{ color: 'green.600', textDecoration: 'none', _dark: { color: 'green.200' } }}
							>
								<NextLink href={link.href}>{link.label}</NextLink>
							</Link>
						);
					})}
				</HStack>
			</Flex>

			<Flex justify="flex-end" align="center" gap={{ base: 3, md: 6 }}>
				<ThemeSwitch />
				<AuthDetails />
				<Menu.Root>
					<Menu.Trigger asChild>
						<IconButton aria-label="Abrir menú" variant="ghost" size="sm" display={{ base: 'inline-flex', lg: 'none' }}>
							<ListIcon size={22} />
						</IconButton>
					</Menu.Trigger>
					<Portal>
						<Menu.Positioner>
							<Menu.Content>
								{NAV_LINKS.map(link => (
									<Menu.Item key={link.href} value={link.href} asChild>
										<NextLink href={link.href}>{link.label}</NextLink>
									</Menu.Item>
								))}
							</Menu.Content>
						</Menu.Positioner>
					</Portal>
				</Menu.Root>
			</Flex>
		</Flex>
	);
}
