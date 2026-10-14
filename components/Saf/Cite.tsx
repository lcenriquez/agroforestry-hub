import { Box, Link, Text } from '@chakra-ui/react';

import { SOURCE_INDEX, SOURCES } from './content';

import type { BoxProps } from '@chakra-ui/react';
import type { Paragraph, SourceId } from './content';

// Marcadores de cita tipo [1, 3] que saltan a la lista de fuentes al final de
// la página (#fuente-<id>).
export function Cite({ ids }: { ids?: SourceId[] }) {
	if (!ids || ids.length === 0) return null;
	const sorted = [...new Set(ids)].sort((a, b) => SOURCE_INDEX[a] - SOURCE_INDEX[b]);

	return (
		<Box as="sup" fontSize="0.7em" lineHeight={0} ms="0.15em" whiteSpace="nowrap">
			[
			{sorted.map((id, i) => {
				const source = SOURCES[SOURCE_INDEX[id] - 1];
				return (
					<span key={id}>
						{i > 0 && ', '}
						<Link
							href={`#fuente-${id}`}
							title={source ? `${source.publisher}: ${source.title}` : undefined}
							color="green.700"
							_dark={{ color: 'green.300' }}
							textDecoration="none"
							_hover={{ textDecoration: 'underline' }}
						>
							{SOURCE_INDEX[id]}
						</Link>
					</span>
				);
			})}
			]
		</Box>
	);
}

// Un párrafo del archivo de contenido con sus citas al final.
export function CitedText({ paragraph, ...props }: { paragraph: Paragraph } & BoxProps) {
	return (
		<Text {...props}>
			{paragraph.text}
			<Cite ids={paragraph.cites} />
		</Text>
	);
}
