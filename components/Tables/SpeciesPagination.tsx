import { Button, HStack, Pagination } from '@chakra-ui/react';

interface SpeciesPaginationProps {
	count: number;
	pageSize: number;
	page: number;
	onPageChange: (page: number) => void;
}

export default function SpeciesPagination({ count, pageSize, page, onPageChange }: SpeciesPaginationProps) {
	if (count <= pageSize) return null;

	return (
		<Pagination.Root
			count={count}
			pageSize={pageSize}
			page={page}
			onPageChange={details => onPageChange(details.page)}
			translations={{
				rootLabel: 'Paginación',
				prevTriggerLabel: 'Página anterior',
				nextTriggerLabel: 'Página siguiente',
				itemLabel: ({ page: itemPage }) => `Página ${itemPage}`
			}}
		>
			<HStack justify="center" mt={4} gap={4}>
				<Pagination.PrevTrigger asChild>
					<Button variant="outline" size="sm">
						Anterior
					</Button>
				</Pagination.PrevTrigger>
				<Pagination.PageText format={({ page: currentPage, totalPages }) => `Página ${currentPage} de ${totalPages}`} />
				<Pagination.NextTrigger asChild>
					<Button variant="outline" size="sm">
						Siguiente
					</Button>
				</Pagination.NextTrigger>
			</HStack>
		</Pagination.Root>
	);
}
