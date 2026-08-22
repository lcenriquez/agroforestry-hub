import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Container, Heading, Link, Separator, Stack, Text } from '@chakra-ui/react';

import { getExperiencesForSpecies, getSpeciesById } from '../adapters/firestore';
import LoadingScreen from '../components/Elements/LoadingScreen';
import ExperienceForm from '../components/Experiences/ExperienceForm';
import ExperienceList from '../components/Experiences/ExperienceList';
import { useAuth } from '../contexts/AuthContext';
import { withPublicLayout } from '../hocs/withLayout';

import type { Experience } from '../interfaces/Experience';
import type { SpeciesType } from '../interfaces/Species';

function SpeciesDetail() {
	const router = useRouter();
	const { authUser } = useAuth();
	const speciesId = typeof router.query.id === 'string' ? router.query.id : '';

	const [species, setSpecies] = useState<SpeciesType | null>(null);
	const [experiences, setExperiences] = useState<Experience[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!speciesId) return;

		let cancelled = false;
		Promise.all([getSpeciesById(speciesId), getExperiencesForSpecies(speciesId)]).then(([speciesResult, experiencesResult]) => {
			if (cancelled) return;
			setSpecies(speciesResult);
			setExperiences(experiencesResult);
			setLoading(false);
		});

		return () => {
			cancelled = true;
		};
	}, [speciesId]);

	if (!speciesId || loading) return <LoadingScreen />;
	if (!species) return <Text>No encontramos esta especie.</Text>;

	return (
		<Container maxW="container.xl" py="2em">
			<Stack gap={6}>
				<Stack gap={0}>
					<Heading size="lg">{`${species.taxonomy.genus} ${species.taxonomy.species}`}</Heading>
					<Text fontStyle="italic" color="fg.muted">
						{species.commonNames.es_mx?.join(', ')}
					</Text>
				</Stack>

				<Separator />

				<Stack gap={4}>
					<Heading size="md">Experiencias de la comunidad</Heading>
					<ExperienceList experiences={experiences} />
				</Stack>

				<Separator />

				<Stack gap={4}>
					<Heading size="md">Comparte tu experiencia</Heading>
					{authUser ? (
						<ExperienceForm speciesId={speciesId} onCreated={experience => setExperiences(current => [experience, ...current])} />
					) : (
						<Text>
							<Link asChild color="blue.400">
								<NextLink href={{ pathname: '/signin', query: { from: router.asPath } }}>Inicia sesión</NextLink>
							</Link>{' '}
							para compartir tu experiencia con esta especie.
						</Text>
					)}
				</Stack>
			</Stack>
		</Container>
	);
}

export default withPublicLayout(SpeciesDetail, 'Experiencias compartidas por la comunidad');
