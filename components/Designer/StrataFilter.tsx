import { Button, HStack, Text } from '@chakra-ui/react';
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';

import { StratumDot } from './SpeciesPalette';

import type { StratumInfo } from './strata';

interface StrataFilterProps {
	// Estratos con plantas en el diseño, de más alto a más bajo, con su número de plantas.
	strata: { stratum: StratumInfo; count: number }[];
	hidden: Set<string>;
	onToggle: (stratumId: string) => void;
	onSolo: (stratumId: string) => void;
	onShowAll: () => void;
}

// Filtro de visibilidad por estrato del plano y del perfil. Es una preferencia
// de vista: no cambia el diseño ni el análisis, que siempre usa todas las plantas.
export default function StrataFilter({ strata, hidden, onToggle, onSolo, onShowAll }: StrataFilterProps) {
	if (strata.length < 2 && !hidden.size) return null;
	const anyHidden = strata.some(({ stratum }) => hidden.has(stratum._id));

	return (
		<HStack gap={1.5} flexWrap="wrap" fontSize="xs">
			<Text color="fg.muted" title="Clic: mostrar u ocultar · doble clic: ver sólo ese estrato">
				Estratos:
			</Text>
			{strata.map(({ stratum, count }) => {
				const visible = !hidden.has(stratum._id);
				return (
					<Button
						key={stratum._id}
						size="2xs"
						variant={visible ? 'subtle' : 'outline'}
						opacity={visible ? 1 : 0.55}
						aria-pressed={visible}
						title={`${visible ? 'Ocultar' : 'Mostrar'} ${stratum.name.toLowerCase()} · doble clic: sólo este`}
						onClick={() => onToggle(stratum._id)}
						onDoubleClick={() => onSolo(stratum._id)}
					>
						{visible ? <StratumDot color={stratum.color} size="8px" /> : <EyeSlashIcon />}
						{stratum.name} ({count})
					</Button>
				);
			})}
			{anyHidden && (
				<Button size="2xs" variant="ghost" onClick={onShowAll}>
					<EyeIcon /> Ver todos
				</Button>
			)}
		</HStack>
	);
}
