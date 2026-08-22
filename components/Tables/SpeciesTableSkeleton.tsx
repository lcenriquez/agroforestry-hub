import { Skeleton, Stack } from '@chakra-ui/react';

export default function SpeciesTableSkeleton() {
	return (
		<Stack gap={3}>
			{Array.from({ length: 6 }).map((_, index) => (
				<Skeleton key={index} height={{ base: '140px', md: '48px' }} borderRadius="md" />
			))}
		</Stack>
	);
}
