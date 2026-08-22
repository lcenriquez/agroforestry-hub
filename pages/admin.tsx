import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Badge, Button, DataList, Heading, Stack, Text } from '@chakra-ui/react';

import { approveSuggestion, getPendingSuggestions, getSpeciesById, rejectSuggestion } from '../adapters/firestore';
import LoadingScreen from '../components/Elements/LoadingScreen';
import { useAuth } from '../contexts/AuthContext';
import { withAuthedLayout } from '../hocs/withLayout';

import type { SpeciesInput, SpeciesType } from '../interfaces/Species';
import type { SpeciesSuggestion } from '../interfaces/SpeciesSuggestion';

function summarize(data: SpeciesInput): string {
	return [
		`${data.taxonomy.genus} ${data.taxonomy.species}`,
		data.commonNames.es_mx.join(', '),
		data.stratums.map(stratum => stratum.name.es_mx).join(', '),
		data.ecologicalZones.mx.map(zone => zone.name.es_mx).join(', ')
	]
		.filter(Boolean)
		.join(' · ');
}

function SuggestionCard({ suggestion, onResolved }: { suggestion: SpeciesSuggestion; onResolved: (id: string) => void }) {
	const [current, setCurrent] = useState<SpeciesType | null>(null);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (suggestion.type === 'edit' && suggestion.speciesId) getSpeciesById(suggestion.speciesId).then(setCurrent);
	}, [suggestion.speciesId, suggestion.type]);

	async function handleApprove() {
		setBusy(true);
		await approveSuggestion(suggestion);
		onResolved(suggestion._id);
	}

	async function handleReject() {
		setBusy(true);
		await rejectSuggestion(suggestion._id);
		onResolved(suggestion._id);
	}

	return (
		<Stack gap={3} borderWidth="1px" borderRadius="md" p={4}>
			<Stack direction="row" justify="space-between" align="center">
				<Badge colorPalette={suggestion.type === 'new' ? 'green' : 'blue'}>{suggestion.type === 'new' ? 'Especie nueva' : 'Edición'}</Badge>
				<Text fontSize="sm" color="fg.muted">
					{suggestion.authorEmail} · {new Date(suggestion.createdAt).toLocaleDateString('es-MX')}
				</Text>
			</Stack>

			<DataList.Root gap={2}>
				{suggestion.type === 'edit' && current && (
					<DataList.Item>
						<DataList.ItemLabel>Registro actual</DataList.ItemLabel>
						<DataList.ItemValue>{summarize(current)}</DataList.ItemValue>
					</DataList.Item>
				)}
				<DataList.Item>
					<DataList.ItemLabel>Propuesto</DataList.ItemLabel>
					<DataList.ItemValue>{summarize(suggestion.proposedData)}</DataList.ItemValue>
				</DataList.Item>
			</DataList.Root>

			<Stack direction="row" gap={3}>
				<Button size="sm" colorPalette="green" onClick={handleApprove} loading={busy}>
					Aprobar
				</Button>
				<Button size="sm" variant="outline" colorPalette="red" onClick={handleReject} loading={busy}>
					Rechazar
				</Button>
			</Stack>
		</Stack>
	);
}

function Admin() {
	const router = useRouter();
	const { authUser, isAdmin, loading: authLoading } = useAuth();
	const [suggestions, setSuggestions] = useState<SpeciesSuggestion[] | null>(null);

	useEffect(() => {
		if (!authLoading && authUser && !isAdmin) router.push('/');
	}, [authLoading, authUser, isAdmin, router]);

	useEffect(() => {
		if (isAdmin) getPendingSuggestions().then(setSuggestions);
	}, [isAdmin]);

	function handleResolved(id: string) {
		setSuggestions(current => current?.filter(suggestion => suggestion._id !== id) ?? current);
	}

	if (!isAdmin || suggestions === null) return <LoadingScreen />;

	return (
		<Stack gap={6}>
			<Heading size="md">Sugerencias pendientes</Heading>
			{suggestions.length === 0 ? (
				<Text color="fg.muted">No hay sugerencias pendientes.</Text>
			) : (
				<Stack gap={4}>
					{suggestions.map(suggestion => (
						<SuggestionCard key={suggestion._id} suggestion={suggestion} onResolved={handleResolved} />
					))}
				</Stack>
			)}
		</Stack>
	);
}

export default withAuthedLayout(Admin, 'Panel de administración');
