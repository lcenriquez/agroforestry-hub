import { Badge, Box, Heading, HStack, Image, SimpleGrid, Stack, Text } from '@chakra-ui/react';

import type { Experience } from '../../interfaces/Experience';

const LIGHT_LABELS: Record<Experience['lightExposure'], string> = {
	H: 'Sol directo',
	M: 'Media sombra',
	L: 'Sombra'
};

function formatDate(epochMs: number) {
	return new Date(epochMs).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ExperienceList({ experiences }: { experiences: Experience[] }) {
	if (experiences.length === 0) {
		return <Text color="fg.muted">Todavía nadie ha compartido su experiencia con esta especie. ¡Sé la primera persona!</Text>;
	}

	return (
		<Stack gap={6}>
			{experiences.map(experience => (
				<Box key={experience._id} borderWidth="1px" borderRadius="md" p={4}>
					<HStack justify="space-between" mb={2} flexWrap="wrap">
						<Heading size="sm">{experience.location}</Heading>
						<Text fontSize="0.8rem" color="fg.muted">
							{experience.authorEmail} · {formatDate(experience.createdAt)}
						</Text>
					</HStack>
					<HStack gap={2} mb={2} flexWrap="wrap">
						<Badge>{experience.climate}</Badge>
						<Badge>{LIGHT_LABELS[experience.lightExposure]}</Badge>
						<Badge>{experience.soilType}</Badge>
					</HStack>
					{experience.notes && <Text mb={3}>{experience.notes}</Text>}
					{experience.photoUrls.length > 0 && (
						<SimpleGrid columns={{ base: 3, sm: 5 }} gap={2} maxW="400px">
							{experience.photoUrls.map(url => (
								<Image key={url} src={url} alt={`Foto compartida por ${experience.authorEmail}`} borderRadius="md" objectFit="cover" boxSize="80px" />
							))}
						</SimpleGrid>
					)}
				</Box>
			))}
		</Stack>
	);
}
