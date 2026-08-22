import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Alert, Button, Input, Link, Spinner, Stack, Text } from '@chakra-ui/react';

import { importSpecies } from '../../adapters/firestore';
import LoadingScreen from '../../components/Elements/LoadingScreen';
import { parseSpeciesWorkbook, taxonomyKey } from '../../components/Species/importSpeciesExcel';
import { useSpeciesCatalogs } from '../../components/Species/useSpeciesCatalogs';
import { useAuth } from '../../contexts/AuthContext';
import { withAuthedLayout } from '../../hocs/withLayout';

import type { ImportSpeciesResult } from '../../adapters/firestore';
import type { ParsedSpeciesRow } from '../../components/Species/importSpeciesExcel';

function ImportSpecies() {
	const router = useRouter();
	const { authUser, isAdmin, loading: authLoading } = useAuth();
	const { catalogs, species, loading: catalogsLoading } = useSpeciesCatalogs(true);

	const [fileName, setFileName] = useState<string | null>(null);
	const [parsing, setParsing] = useState(false);
	const [fileError, setFileError] = useState<string | null>(null);
	const [rows, setRows] = useState<ParsedSpeciesRow[] | null>(null);
	const [importing, setImporting] = useState(false);
	const [importError, setImportError] = useState<string | null>(null);
	const [result, setResult] = useState<ImportSpeciesResult | null>(null);

	useEffect(() => {
		if (!authLoading && authUser && !isAdmin) router.push('/');
	}, [authLoading, authUser, isAdmin, router]);

	async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;

		setFileName(file.name);
		setResult(null);
		setRows(null);
		setFileError(null);
		setParsing(true);
		try {
			const parsed = await parseSpeciesWorkbook(file, catalogs);
			setFileError(parsed.fileError);
			setRows(parsed.rows);
		} catch {
			setFileError('No se pudo leer el archivo, verifica que sea un .xlsx válido.');
		} finally {
			setParsing(false);
		}
	}

	async function handleConfirm() {
		if (!rows) return;
		setImporting(true);
		setImportError(null);
		try {
			setResult(
				await importSpecies(
					rows.map(row => row.input),
					species
				)
			);
		} catch {
			setImportError('No se pudo completar la importación, intenta de nuevo.');
		} finally {
			setImporting(false);
		}
	}

	if (!isAdmin) return <LoadingScreen />;

	const existingKeys = new Set(species.map(sp => taxonomyKey(sp.taxonomy)));
	const willUpdate = rows?.filter(row => existingKeys.has(taxonomyKey(row.input.taxonomy))).length ?? 0;
	const willCreate = (rows?.length ?? 0) - willUpdate;
	const warnings = rows?.flatMap(row => row.warnings) ?? [];

	return (
		<Stack gap={6}>
			<Text>
				Sube un archivo <Text as="strong">.xlsx</Text> con el mismo formato que la base de datos de especies (pestaña{' '}
				<Text as="strong">ESPECIES</Text>) para cargar o actualizar especies del catálogo en lote.
			</Text>

			<Input type="file" accept=".xlsx" onChange={handleFileChange} maxW="sm" disabled={catalogsLoading} />

			{catalogsLoading && <Spinner />}
			{parsing && <Spinner />}

			{fileError && (
				<Alert.Root status="error">
					<Alert.Indicator />
					<Alert.Title>{fileError}</Alert.Title>
				</Alert.Root>
			)}

			{rows && !fileError && !result && (
				<Stack gap={4}>
					<Text>
						<Text as="strong">{fileName}</Text>: {rows.length} especies encontradas — {willCreate} nuevas, {willUpdate} actualizarán una especie
						existente.
					</Text>

					{warnings.length > 0 && (
						<Stack gap={2} borderWidth="1px" borderRadius="md" p={4} maxH="16em" overflowY="auto">
							<Text fontWeight="medium">{warnings.length} advertencias (no bloquean la importación):</Text>
							{warnings.map((warning, index) => (
								<Text key={index} fontSize="sm" color="fg.muted">
									Fila {warning.row} — {warning.field}: sin coincidencia en el catálogo para &quot;{warning.value}&quot;
								</Text>
							))}
						</Stack>
					)}

					{importError && (
						<Alert.Root status="error">
							<Alert.Indicator />
							<Alert.Title>{importError}</Alert.Title>
						</Alert.Root>
					)}

					<Button colorPalette="blue" alignSelf="start" onClick={handleConfirm} loading={importing} loadingText="Importando">
						Importar {rows.length} especies
					</Button>
				</Stack>
			)}

			{result && (
				<Alert.Root status="success">
					<Alert.Indicator />
					<Alert.Title>
						Listo: {result.created} especies creadas, {result.updated} actualizadas.
					</Alert.Title>
				</Alert.Root>
			)}

			<Text>
				<Link asChild color="blue.400">
					<NextLink href="/admin">Volver al panel de administración</NextLink>
				</Link>
			</Text>
		</Stack>
	);
}

export default withAuthedLayout(ImportSpecies, 'Importar especies desde excel');
