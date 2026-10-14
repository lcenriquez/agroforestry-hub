import NextLink from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { Container, Heading, Link, Stack, Text } from '@chakra-ui/react';

import { getSpecies } from '../adapters/firestore';
import HeroBanner from '../components/Home/HeroBanner';
import SafSummary from '../components/Home/SafSummary';
import { emptyFilterState, filterSpeciesList, uniqueById } from '../components/Tables/filterSpecies';
import SpeciesCards from '../components/Tables/SpeciesCards';
import SpeciesFilters from '../components/Tables/SpeciesFilters';
import SpeciesLegend from '../components/Tables/SpeciesLegend';
import SpeciesPagination from '../components/Tables/SpeciesPagination';
import SpeciesTable from '../components/Tables/SpeciesTable';
import SpeciesTableSkeleton from '../components/Tables/SpeciesTableSkeleton';
import { withPublicLayout } from '../hocs/withLayout';

import type { NextPage } from 'next';
import type { SpeciesFilterState } from '../components/Tables/filterSpecies';
import type { SpeciesType } from '../interfaces/Species';

const PAGE_SIZE = 20;

const Home: NextPage = () => {
	const [species, setSpecies] = useState<SpeciesType[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [filters, setFilters] = useState<SpeciesFilterState>(emptyFilterState());
	const [page, setPage] = useState(1);

	useEffect(() => {
		getSpecies().then(result => {
			setSpecies(result);
			setLoading(false);
		});
	}, []);

	const stratums = useMemo(() => uniqueById(species.flatMap(sp => sp.stratums)), [species]);
	const zones = useMemo(() => uniqueById(species.flatMap(sp => sp.ecologicalZones.mx)), [species]);
	const ecoFunctions = useMemo(() => uniqueById(species.flatMap(sp => sp.ecologicalFunctions)), [species]);
	const addFunctions = useMemo(() => uniqueById(species.flatMap(sp => sp.additionalFunctions)), [species]);

	const filtered = useMemo(() => filterSpeciesList(species, search, filters), [species, search, filters]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const currentPage = Math.min(page, totalPages);
	const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

	function handleSearchChange(value: string) {
		setSearch(value);
		setPage(1);
	}

	function handleFiltersChange(next: SpeciesFilterState) {
		setFilters(next);
		setPage(1);
	}

	return (
		<>
			<HeroBanner />
			<Container maxW="container.xl" pb="2em" flexShrink={0}>
				<Stack gap={{ base: 10, md: 14 }} pt={{ base: 8, md: 12 }}>
					<SafSummary />

					<Stack as="section" id="catalogo" aria-labelledby="catalogo-title" gap={6} scrollMarginTop={4}>
						<Stack gap={2}>
							<Heading as="h2" id="catalogo-title" size="2xl">
								Catálogo de especies
							</Heading>
							<Text color="fg.muted" maxW="3xl">
								Información práctica sobre especies usadas en SAF: estrato, zona ecológica, altura, funciones ecológicas y más, junto con experiencias
								reales de cultivo compartidas por la comunidad. Filtra por lo que buscas y comparte tu propia experiencia con cada especie.
							</Text>
						</Stack>

						<Text>
							¿No encuentras una especie?{' '}
							<Link asChild color="blue.400">
								<NextLink href="/suggest-species">Sugiérela</NextLink>
							</Link>
						</Text>

						{!loading && species.length > 0 && (
							<SpeciesFilters
								search={search}
								onSearchChange={handleSearchChange}
								filters={filters}
								onFiltersChange={handleFiltersChange}
								stratums={stratums}
								zones={zones}
								ecoFunctions={ecoFunctions}
								addFunctions={addFunctions}
							/>
						)}

						{loading ? (
							<SpeciesTableSkeleton />
						) : filtered.length === 0 ? (
							<Text color="fg.muted">No encontramos especies con esos filtros.</Text>
						) : (
							<>
								<SpeciesLegend stratums={stratums} zones={zones} ecoFunctions={ecoFunctions} addFunctions={addFunctions} />
								<SpeciesTable species={paged} />
								<SpeciesCards species={paged} />
								<SpeciesPagination count={filtered.length} pageSize={PAGE_SIZE} page={currentPage} onPageChange={setPage} />
							</>
						)}
					</Stack>
				</Stack>
			</Container>
		</>
	);
};

export default withPublicLayout(Home, 'Toda la información que necesitas sobre SAFs');
