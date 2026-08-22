import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { Container, Link, Spinner, Stack, Text } from '@chakra-ui/react';

import { createSpecies, createSpeciesSuggestion } from '../adapters/firestore';
import SpeciesForm from '../components/Species/SpeciesForm';
import { useSpeciesCatalogs } from '../components/Species/useSpeciesCatalogs';
import { useAuth } from '../contexts/AuthContext';
import { withPublicLayout } from '../hocs/withLayout';

import type { SpeciesInput } from '../interfaces/Species';

function SuggestSpecies() {
	const router = useRouter();
	const { authUser, isAdmin } = useAuth();
	const { catalogs, loading } = useSpeciesCatalogs(true);
	const [sent, setSent] = useState(false);
	const [createdId, setCreatedId] = useState<string | null>(null);

	async function handleSubmit(data: SpeciesInput) {
		if (!authUser) return;

		if (isAdmin) {
			const id = await createSpecies(data);
			setCreatedId(id);
			return;
		}

		await createSpeciesSuggestion({
			type: 'new',
			proposedData: data,
			authorId: authUser.uid,
			authorEmail: authUser.email,
			createdAt: Date.now(),
			status: 'pending'
		});
		setSent(true);
	}

	return (
		<Container maxW="container.md" py="2em">
			<Stack gap={6}>
				<Text>
					¿No encuentras una especie en el catálogo? Complétala aquí{isAdmin ? '' : ' y quedará pendiente de revisión antes de publicarse'}.
				</Text>

				{!authUser && (
					<Text>
						<Link asChild color="blue.400">
							<NextLink href={{ pathname: '/signin', query: { from: router.asPath } }}>Inicia sesión</NextLink>
						</Link>{' '}
						para sugerir una especie nueva.
					</Text>
				)}

				{authUser && sent && <Text>Tu sugerencia fue enviada, quedará pendiente de revisión.</Text>}

				{authUser && createdId && (
					<Text>
						Especie creada.{' '}
						<Link asChild color="blue.400">
							<NextLink href={{ pathname: '/species', query: { id: createdId } }}>Verla en el catálogo</NextLink>
						</Link>
					</Text>
				)}

				{authUser &&
					!sent &&
					!createdId &&
					(loading ? (
						<Spinner />
					) : (
						<SpeciesForm catalogs={catalogs} onSubmit={handleSubmit} submitLabel={isAdmin ? 'Crear especie' : 'Enviar sugerencia'} />
					))}
			</Stack>
		</Container>
	);
}

export default withPublicLayout(SuggestSpecies, 'Sugerir una especie nueva', 'Sugerir especie');
