import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

const eslintConfig = [
	...nextCoreWebVitals,
	...nextTypescript,
	prettierRecommended,
	{
		rules: {
			'linebreak-style': ['error', 'unix'],
			// The Firestore data layer (adapters/firestore.ts, SpeciesTable, VisualRepresentations)
			// is intentionally loosely typed until a full schema for the `species`/`stratums`
			// collections is introduced - see README "Known limitations".
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-empty-object-type': 'off'
		}
	}
];

export default eslintConfig;
