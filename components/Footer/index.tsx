import { ReactNode } from 'react';

import { Box, chakra, HStack, Link, Stack, Text, VisuallyHidden } from '@chakra-ui/react';
import { FacebookLogo, InstagramLogo, YoutubeLogo } from '@phosphor-icons/react';

import Logo from '../Elements/Logo';

const SocialButton = ({ children, label, href }: { children: ReactNode; label: string; href: string }) => {
	return (
		<chakra.button
			asChild
			bg="blackAlpha.100"
			rounded="full"
			w={8}
			h={8}
			cursor="pointer"
			display="inline-flex"
			alignItems="center"
			justifyContent="center"
			transition="background 0.3s ease"
			_hover={{ bg: 'blackAlpha.200' }}
			_dark={{ bg: 'whiteAlpha.100', _hover: { bg: 'whiteAlpha.200' } }}
		>
			<a href={href} target="_blank" rel="noreferrer">
				<VisuallyHidden>{label}</VisuallyHidden>
				{children}
			</a>
		</chakra.button>
	);
};

export default function SmallWithLogoLeft() {
	return (
		<Box bg="gray.50" color="gray.700" _dark={{ bg: 'gray.900', color: 'gray.200' }} mt="auto" width="100%">
			<Stack
				maxW="6xl"
				mx="auto"
				px={4}
				py={4}
				direction={{ base: 'column', md: 'row' }}
				gap={4}
				justify={{ base: 'center', md: 'space-between' }}
				align={{ base: 'center', md: 'center' }}
			>
				<HStack gap={2}>
					<Logo size={32} />
					<Text fontWeight="bold">SAF Hub</Text>
				</HStack>
				<Text>
					En colaboración con{' '}
					<Link href="https://ungranitodetierra.antilabs.com.mx" target="_blank" rel="noreferrer">
						Un Granito de Tierra
					</Link>{' '}
					y{' '}
					<Link href="https://bosquedeniebla.com.mx" target="_blank" rel="noreferrer">
						Bosque de Niebla
					</Link>
				</Text>
				<Stack direction="row" gap={6}>
					<SocialButton label="Facebook" href="https://www.facebook.com/ungranitodetierra/">
						<FacebookLogo />
					</SocialButton>
					<SocialButton label="YouTube" href="#">
						<YoutubeLogo />
					</SocialButton>
					<SocialButton label="Instagram" href="https://www.instagram.com/ungranitodetierra/">
						<InstagramLogo />
					</SocialButton>
				</Stack>
			</Stack>
		</Box>
	);
}
