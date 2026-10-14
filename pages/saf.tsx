import { Box, Container, Grid, Stack } from '@chakra-ui/react';

import SafHero from '../components/Saf/SafHero';
import {
	BenefitsSection,
	ChallengesSection,
	ClassificationSection,
	DefinitionSection,
	FaqSection,
	GlossarySection,
	PracticesSection,
	SourcesSection,
	StepsSection,
	StrataSection
} from '../components/Saf/SafSections';
import { SafTocInline, SafTocSidebar } from '../components/Saf/SafToc';
import { withPublicLayout } from '../hocs/withLayout';

import type { NextPage } from 'next';

const SafPage: NextPage = () => {
	return (
		<Container maxW="7xl" px={{ base: 4, md: 6 }} py={{ base: 4, md: 8 }}>
			<SafHero />

			<Grid templateColumns={{ base: 'minmax(0, 1fr)', lg: '220px minmax(0, 1fr)' }} gap={{ base: 6, lg: 10 }} mt={{ base: 6, md: 10 }}>
				<Box as="aside" display={{ base: 'none', lg: 'block' }}>
					<SafTocSidebar />
				</Box>

				<Stack gap={{ base: 12, md: 16 }} minW={0} maxW="4xl">
					<Box display={{ base: 'block', lg: 'none' }}>
						<SafTocInline />
					</Box>
					<DefinitionSection />
					<ClassificationSection />
					<PracticesSection />
					<StrataSection />
					<BenefitsSection />
					<ChallengesSection />
					<StepsSection />
					<GlossarySection />
					<FaqSection />
					<SourcesSection />
				</Stack>
			</Grid>
		</Container>
	);
};

export default withPublicLayout(SafPage, '¿Qué es un SAF?');
