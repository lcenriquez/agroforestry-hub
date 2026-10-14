// Contenido de la página /saf. Todo el texto largo vive aquí para que sea fácil
// de editar sin tocar los componentes. Las cifras llevan siempre `cites` con el
// id de su fuente (ver SOURCES al final); si agregas un dato nuevo, agrega
// también su fuente.

import {
	ClockIcon,
	CoffeeIcon,
	CompassIcon,
	CowIcon,
	CurrencyDollarIcon,
	EyeIcon,
	GraduationCapIcon,
	HandHeartIcon,
	HouseIcon,
	LeafIcon,
	MagnifyingGlassIcon,
	MountainsIcon,
	PathIcon,
	PencilRulerIcon,
	PlantIcon,
	ScissorsIcon,
	StorefrontIcon,
	SunIcon,
	TreeEvergreenIcon,
	TreeIcon,
	UsersThreeIcon,
	WavesIcon,
	WindIcon
} from '@phosphor-icons/react';

import type { Icon } from '@phosphor-icons/react';

export type SourceId =
	| 'fao-gfs'
	| 'fao-agroforestry'
	| 'fao-dg-2023'
	| 'fao-livelihoods'
	| 'icraf-definicion'
	| 'leakey-1996'
	| 'nair-clasificacion'
	| 'zomer-2016'
	| 'wikifarmer-sintropica'
	| 'andrade-pasini'
	| 'miaf-gob'
	| 'miaf-agrociencia'
	| 'miaf-colpos'
	| 'sembrando-vida-2026'
	| 'milpa-ideas'
	| 'huertos-qroo'
	| 'cafetales-aves'
	| 'cacao-soconusco'
	| 'telom-fao'
	| 'telom-uaslp'
	| 'chinampas-fao'
	| 'silvopastoril-tabasco'
	| 'silvopastoril-colpos'
	| 'cercas-vivas-rbt'
	| 'taungya-nal'
	| 'iied-barreras'
	| 'tranchina-2024';

export interface Paragraph {
	text: string;
	cites?: SourceId[];
}

export interface TocItem {
	id: string;
	label: string;
}

export const TOC: TocItem[] = [
	{ id: 'que-es', label: '¿Qué es un SAF?' },
	{ id: 'clasificacion', label: 'Clasificación' },
	{ id: 'practicas', label: 'Prácticas y ejemplos' },
	{ id: 'estratos', label: 'Estratos y sucesión' },
	{ id: 'beneficios', label: 'Beneficios' },
	{ id: 'retos', label: 'Retos' },
	{ id: 'como-empezar', label: 'Cómo empezar' },
	{ id: 'glosario', label: 'Glosario' },
	{ id: 'preguntas', label: 'Preguntas frecuentes' },
	{ id: 'fuentes', label: 'Fuentes' }
];

// ---------------------------------------------------------------------------
// Encabezado y cifras clave
// ---------------------------------------------------------------------------

export const HERO = {
	eyebrow: 'Guía introductoria',
	title: 'Sistemas agroforestales (SAF)',
	lead: 'Sembrar árboles junto con cultivos y animales es una de las formas más antiguas de hacer agricultura en México. Aquí te contamos qué es un SAF, qué tipos existen, cómo se organizan en estratos y cómo empezar a diseñar el tuyo.'
};

export interface KeyStat {
	value: string;
	label: string;
	cites: SourceId[];
}

export const KEY_STATS: KeyStat[] = [
	{
		value: '43 %',
		label: 'de las tierras agrícolas del mundo tiene más de 10 % de cobertura arbórea (datos 2008–2010).',
		cites: ['zomer-2016', 'fao-agroforestry']
	},
	{
		value: '+900 millones',
		label: 'de personas viven en las zonas agrícolas donde se practica la agroforestería.',
		cites: ['fao-agroforestry']
	},
	{
		value: '75 %',
		label: 'del carbono en biomasa de las tierras agrícolas está en sus árboles.',
		cites: ['zomer-2016']
	}
];

// ---------------------------------------------------------------------------
// 1. ¿Qué es un SAF?
// ---------------------------------------------------------------------------

export const DEFINITION: Paragraph[] = [
	{
		text: 'Un sistema agroforestal (SAF) es una forma de usar la tierra en la que se combinan, a propósito y en la misma parcela, plantas leñosas perennes (árboles, arbustos, palmas o bambús) con cultivos agrícolas y/o animales. La combinación puede ser en el espacio (todo al mismo tiempo) o en el tiempo (una etapa tras otra).',
		cites: ['fao-gfs', 'icraf-definicion']
	},
	{
		text: 'Lo que distingue a un SAF de simplemente “tener árboles en el rancho” es que sus componentes interactúan: los árboles dan sombra, abono, forraje o protección contra el viento, y los cultivos y animales aprovechan esas condiciones. Esas interacciones son tanto ecológicas como económicas.',
		cites: ['icraf-definicion']
	},
	{
		text: 'Con el tiempo, la definición se ha ampliado: más que una técnica, la agroforestería se entiende como un sistema dinámico de manejo de recursos naturales, basado en la ecología, que diversifica la producción y busca beneficios sociales, económicos y ambientales para quienes la practican.',
		cites: ['leakey-1996', 'fao-gfs']
	}
];

export const DEFINITION_HIGHLIGHT: Paragraph = {
	text: 'En pocas palabras: un SAF es agricultura con árboles, diseñada para que cada especie ayude a las demás.',
	cites: ['icraf-definicion']
};

// ---------------------------------------------------------------------------
// 2. Clasificación
// ---------------------------------------------------------------------------

export interface ClassificationItem {
	title: string;
	formula: string;
	description: string;
	examples: string;
	icon: Icon;
}

export const CLASSIFICATION_INTRO: Paragraph = {
	text: 'La clasificación más usada (propuesta por P. K. R. Nair para ICRAF) agrupa los SAF según sus componentes: leñosas perennes, cultivos herbáceos y animales. De ahí salen tres tipos básicos, más algunos sistemas especializados.',
	cites: ['nair-clasificacion']
};

export const CLASSIFICATION: ClassificationItem[] = [
	{
		title: 'Silvoagrícolas',
		formula: 'Árboles + cultivos',
		description: 'Combinan árboles o arbustos con cultivos agrícolas en la misma parcela.',
		examples: 'Cultivo en callejones, taungya, MIAF, cafetales y cacaotales bajo sombra.',
		icon: PlantIcon
	},
	{
		title: 'Silvopastoriles',
		formula: 'Árboles + pastos y/o ganado',
		description: 'Integran árboles con pastizales y animales de pastoreo.',
		examples: 'Árboles dispersos en potreros, cercas vivas, bancos de forraje con leucaena o guaje.',
		icon: CowIcon
	},
	{
		title: 'Agrosilvopastoriles',
		formula: 'Árboles + cultivos + animales',
		description: 'Reúnen los tres componentes; suelen ser los más complejos de manejar.',
		examples: 'Huertos familiares y solares con frutales, hortalizas, gallinas y cerdos.',
		icon: HouseIcon
	},
	{
		title: 'Sistemas especializados',
		formula: 'Árboles + abejas, peces u otros',
		description: 'Combinaciones menos comunes que también se consideran agroforestales.',
		examples: 'Apicultura con árboles melíferos, acuacultura en manglares o en estanques bordeados de árboles.',
		icon: WavesIcon
	}
];

// ---------------------------------------------------------------------------
// 3. Prácticas y ejemplos
// ---------------------------------------------------------------------------

export interface Practice {
	title: string;
	tag: string;
	icon: Icon;
	description: Paragraph[];
	mexico?: Paragraph;
}

export const PRACTICES_INTRO: Paragraph = {
	text: 'Las formas que toma la agroforestería cambian mucho de un paisaje a otro según el clima, la cultura y la economía de cada lugar. Estas son algunas de las prácticas más comunes, con ejemplos de México y Mesoamérica.',
	cites: ['fao-gfs']
};

export const PRACTICES: Practice[] = [
	{
		title: 'Milpa Intercalada con Árboles Frutales (MIAF)',
		tag: 'Silvoagrícola',
		icon: MountainsIcon,
		description: [
			{
				text: 'Policultivo en franjas: maíz nativo como cultivo principal, intercalado con frijol, calabaza u otras especies de porte bajo y con hileras de árboles frutales, todo trazado en curvas a nivel en terrenos de ladera.',
				cites: ['miaf-gob', 'miaf-agrociencia']
			},
			{
				text: 'Las franjas de frutales, perpendiculares a la pendiente, ayudan a frenar la erosión del suelo y diversifican el ingreso familiar. Fue desarrollado por el INIFAP y el Colegio de Postgraduados durante más de 30 años de colaboración.',
				cites: ['miaf-agrociencia', 'miaf-colpos']
			}
		],
		mexico: {
			text: 'El durazno es hoy el frutal más usado en MIAF. El programa Sembrando Vida promueve SAF y MIAF que combinan árboles con maíz, frijol y calabaza.',
			cites: ['miaf-agrociencia', 'sembrando-vida-2026']
		}
	},
	{
		title: 'Huertos familiares y solares',
		tag: 'Agrosilvopastoril',
		icon: HouseIcon,
		description: [
			{
				text: 'Alrededor de la casa se combinan árboles maderables y frutales, plantas medicinales y de ornato, hortalizas y animales domésticos en varios estratos. Son una fuente cercana de alimento, medicina e ingreso.',
				cites: ['huertos-qroo']
			}
		],
		mexico: {
			text: 'El solar maya es uno de los huertos más estudiados del continente. En 120 huertos de Quintana Roo se registraron 449 especies de 93 familias botánicas.',
			cites: ['huertos-qroo']
		}
	},
	{
		title: 'Cafetales bajo sombra',
		tag: 'Silvoagrícola',
		icon: CoffeeIcon,
		description: [
			{
				text: 'El café crece bajo un dosel de árboles nativos o introducidos que regulan la temperatura y la humedad, aportan hojarasca y ofrecen leña, fruta o madera.',
				cites: ['cafetales-aves']
			}
		],
		mexico: {
			text: 'En México predomina el café cultivado bajo el dosel original, que es el que más biodiversidad conserva: se han reportado entre 90 y 180 especies de aves en cafetales de sombra.',
			cites: ['cafetales-aves']
		}
	},
	{
		title: 'Cacaotales bajo sombra',
		tag: 'Silvoagrícola',
		icon: LeafIcon,
		description: [
			{
				text: 'El cacao se siembra bajo árboles de sombra, sobre todo maderables y frutales. La sombra es benéfica, pero en exceso compite por luz con el cultivo, por lo que hay que elegir bien las especies y podar.',
				cites: ['cacao-soconusco']
			}
		],
		mexico: {
			text: 'La mayor parte del cacao mexicano se produce en Chiapas y Tabasco. En el Soconusco se registraron 35 especies de árboles de sombra, entre ellas laurel (Cordia alliodora), macuilí (Tabebuia rosea) y zapote mamey (Pouteria sapota).',
			cites: ['cacao-soconusco']
		}
	},
	{
		title: 'Te’lom huasteco',
		tag: 'Bosque manejado',
		icon: TreeEvergreenIcon,
		description: [
			{
				text: 'Parcelas de bosque manejado por familias tének (huastecas) que mezclan elementos de bosque primario y secundario con especies introducidas, principalmente café y frutales. Forman un mosaico con la milpa y los huertos caseros.',
				cites: ['telom-fao', 'telom-uaslp']
			}
		],
		mexico: {
			text: 'Se practica en la Huasteca Potosina; el término se usa desde los trabajos de la etnobotánica Janis Alcorn en los años ochenta.',
			cites: ['telom-uaslp']
		}
	},
	{
		title: 'Chinampas',
		tag: 'Agrícola-lacustre',
		icon: WavesIcon,
		description: [
			{
				text: 'Islas de cultivo construidas sobre lagos someros, con canales de agua alrededor y orillas bordeadas por árboles como el ahuejote. Combinan agricultura muy productiva con manejo de agua y biodiversidad.',
				cites: ['chinampas-fao']
			}
		],
		mexico: {
			text: 'La FAO reconoció las chinampas de la Ciudad de México como Sistema Importante del Patrimonio Agrícola Mundial (SIPAM). Sus cinco zonas suman 2,215 hectáreas.',
			cites: ['chinampas-fao']
		}
	},
	{
		title: 'Cercas vivas',
		tag: 'Silvopastoril / lindero',
		icon: PathIcon,
		description: [
			{
				text: 'Árboles o arbustos de crecimiento rápido que sustituyen a los postes muertos para delimitar parcelas y potreros. Además dan forraje, leña y sombra, y pueden funcionar como corredores para la fauna.',
				cites: ['cercas-vivas-rbt']
			}
		],
		mexico: {
			text: 'En la Sierra de Tabasco se encontraron 28 especies en cercas vivas, con densidades de 33 a 187 árboles por cada 100 m de cerca. El cacahuananche (Gliricidia sepium) es una de las especies más usadas.',
			cites: ['silvopastoril-tabasco']
		}
	},
	{
		title: 'Árboles dispersos en potreros',
		tag: 'Silvopastoril',
		icon: CowIcon,
		description: [
			{
				text: 'Árboles que se dejan o se siembran dentro de los potreros. Dan sombra que reduce el estrés por calor del ganado, aportan materia orgánica, reciclan nutrientes profundos y protegen el suelo de la erosión.',
				cites: ['silvopastoril-tabasco', 'silvopastoril-colpos']
			}
		],
		mexico: {
			text: 'En la Sierra de Tabasco se registraron 75 especies de árboles dispersos en potreros, con un promedio de 38 árboles por hectárea.',
			cites: ['silvopastoril-tabasco']
		}
	},
	{
		title: 'Cultivo en callejones',
		tag: 'Silvoagrícola',
		icon: PencilRulerIcon,
		description: [
			{
				text: 'Hileras de árboles o arbustos (con frecuencia leguminosas) con cultivos en los “callejones” de en medio. Las podas de las hileras se usan como abono verde, cobertura o forraje.',
				cites: ['fao-gfs', 'nair-clasificacion']
			}
		]
	},
	{
		title: 'Cortinas rompevientos',
		tag: 'Protección',
		icon: WindIcon,
		description: [
			{
				text: 'Líneas de árboles y arbustos de distintas alturas plantadas en contra del viento dominante para proteger cultivos, animales y viviendas, reducir la pérdida de humedad y frenar la erosión eólica.',
				cites: ['cercas-vivas-rbt']
			}
		]
	},
	{
		title: 'Taungya',
		tag: 'Secuencial',
		icon: TreeIcon,
		description: [
			{
				text: 'Durante los primeros años de una plantación forestal se siembran cultivos de ciclo corto entre los árboles jóvenes. Así se aprovecha el terreno, se controlan malezas, se reducen los costos de establecimiento y se obtiene ingreso temprano.',
				cites: ['taungya-nal', 'fao-gfs']
			}
		]
	},
	{
		title: 'Agricultura sintrópica',
		tag: 'Sucesional',
		icon: ScissorsIcon,
		description: [
			{
				text: 'Enfoque desarrollado por Ernst Götsch que imita la sucesión natural del bosque: consorcios de plantas en alta diversidad y densidad, organizados por estratos y ciclos de vida, con podas frecuentes que aceleran la sucesión y producen materia orgánica.',
				cites: ['andrade-pasini', 'wikifarmer-sintropica']
			}
		]
	}
];

// ---------------------------------------------------------------------------
// 4. Estratos y sucesión
// ---------------------------------------------------------------------------

export interface Stratum {
	id: string;
	name: string;
	occupation: number;
	description: string;
	examples: string;
}

export const STRATA_INTRO: Paragraph[] = [
	{
		text: 'En un bosque, las plantas se acomodan en capas: unas pocas copas emergen por encima de todo y, debajo, cada nivel recibe menos luz. Los SAF de tipo sucesional (como la agricultura sintrópica) copian esa estructura para aprovechar mejor la luz del sol en el espacio vertical.',
		cites: ['wikifarmer-sintropica']
	},
	{
		text: 'Un detalle importante: el estrato de una especie se define por cuánta luz necesita dentro de su consorcio, no solo por la altura que alcanza. Un plátano puede ser estrato alto en un consorcio joven y quedar en el medio cuando crecen los árboles de ciclo largo.',
		cites: ['andrade-pasini']
	}
];

export const STRATA: Stratum[] = [
	{
		id: 'emergente',
		name: 'Emergente',
		occupation: 20,
		description: 'Las especies que más luz necesitan; sus copas quedan por encima de todas las demás.',
		examples: 'Ej.: ceiba, cedro rojo, caoba.'
	},
	{
		id: 'alto',
		name: 'Alto',
		occupation: 40,
		description: 'Forma el dosel principal, justo debajo de las emergentes.',
		examples: 'Ej.: aguacate, mango, chalahuite (Inga).'
	},
	{
		id: 'medio',
		name: 'Medio',
		occupation: 60,
		description: 'Plantas que toleran o prefieren algo de sombra (luz filtrada).',
		examples: 'Ej.: café, cacao, cítricos, guayaba.'
	},
	{
		id: 'bajo',
		name: 'Bajo',
		occupation: 80,
		description: 'Las más tolerantes a la sombra; ocupan el nivel cercano al suelo.',
		examples: 'Ej.: piña, chile, jengibre, hierbas aromáticas.'
	}
];

export const STRATA_NOTE: Paragraph = {
	text: 'Porcentajes aproximados de ocupación del terreno por estrato, propuestos por Ernst Götsch para los “sistemas de abundancia”. Como los estratos se enciman, suman más de 100 % (alrededor de 220 % contando una cubierta rasante de 15–20 %): ese es justamente el aprovechamiento extra de la luz. Úsalos como guía, no como regla. Los ejemplos de especies son orientativos y dependen del clima y del consorcio.',
	cites: ['wikifarmer-sintropica', 'andrade-pasini']
};

export interface SuccessionStage {
	name: string;
	cycle: string;
	description: string;
	examples: string;
}

export const SUCCESSION_INTRO: Paragraph = {
	text: 'Además del espacio, un SAF sucesional se diseña en el tiempo. Las especies se agrupan según la duración de su ciclo de vida y se siembran juntas desde el inicio, para mover poco el suelo: las de ciclo corto dan cosecha y protegen a las de ciclo largo mientras crecen.',
	cites: ['wikifarmer-sintropica']
};

export const SUCCESSION: SuccessionStage[] = [
	{
		name: 'Placenta',
		cycle: 'Meses a 2 años',
		description: 'Plantas anuales y bianuales que cubren el suelo y dan las primeras cosechas.',
		examples: 'Ej.: maíz, frijol, calabaza, hortalizas, abonos verdes.'
	},
	{
		name: 'Secundaria',
		cycle: 'Pocos años a décadas',
		description: 'Arbustos y árboles de ciclo corto y medio; producen fruta y mucha biomasa para podar.',
		examples: 'Ej.: plátano, papaya, yuca, gandul, cocoite.'
	},
	{
		name: 'Clímax y transicional',
		cycle: 'Décadas o más',
		description: 'Especies de ciclo largo y muy largo que forman la estructura madura del sistema.',
		examples: 'Ej.: zapotes, aguacate, cacao, maderables finos.'
	}
];

export const SYSTEM_PHASES: Paragraph = {
	text: 'Götsch describe además tres fases por las que pasa el sistema completo según la fertilidad del suelo: colonización, acumulación y abundancia. Cada consorcio que madura deja el terreno más rico para el siguiente.',
	cites: ['wikifarmer-sintropica', 'andrade-pasini']
};

// ---------------------------------------------------------------------------
// 5. Beneficios
// ---------------------------------------------------------------------------

export interface BenefitGroup {
	title: string;
	icon: Icon;
	items: Paragraph[];
}

export const BENEFITS: BenefitGroup[] = [
	{
		title: 'Ambientales',
		icon: LeafIcon,
		items: [
			{
				text: 'Suelo: más materia orgánica y cobertura, menos erosión y escurrimiento; en laderas, las franjas de árboles (como en MIAF) frenan el arrastre de suelo.',
				cites: ['miaf-agrociencia', 'silvopastoril-colpos']
			},
			{
				text: 'Agua: la cobertura y la hojarasca mejoran la infiltración y conservan la humedad del suelo.',
				cites: ['miaf-agrociencia']
			},
			{
				text: 'Biodiversidad: los cafetales de sombra y las cercas vivas multiestrato dan refugio a aves, insectos y otros polinizadores.',
				cites: ['cafetales-aves', 'cercas-vivas-rbt']
			},
			{
				text: 'Clima: los árboles almacenan la mayor parte del carbono en biomasa de las tierras agrícolas, y la agroforestería puede ayudar a restaurar más de mil millones de hectáreas degradadas.',
				cites: ['zomer-2016', 'fao-dg-2023']
			}
		]
	},
	{
		title: 'Económicos',
		icon: CurrencyDollarIcon,
		items: [
			{
				text: 'Diversificación: madera, fruta, granos, forraje, leña y miel de la misma parcela, con cosechas repartidas a lo largo del año.',
				cites: ['fao-gfs']
			},
			{
				text: 'Resiliencia: depender de varios productos reduce el riesgo ante plagas, malos precios o un mal temporal.',
				cites: ['fao-agroforestry']
			},
			{
				text: 'Productividad: el MIAF se ha reportado como rentable porque aumenta los rendimientos combinados de maíz, frijol, calabaza y frutales en la misma parcela.',
				cites: ['miaf-colpos', 'miaf-agrociencia']
			},
			{
				text: 'Menos insumos: las podas y las leguminosas aportan fertilidad dentro del propio sistema.',
				cites: ['andrade-pasini']
			}
		]
	},
	{
		title: 'Sociales y culturales',
		icon: UsersThreeIcon,
		items: [
			{
				text: 'Soberanía alimentaria: la milpa, el solar y el huerto aseguran alimento variado cerca de casa.',
				cites: ['huertos-qroo', 'milpa-ideas']
			},
			{
				text: 'Saberes tradicionales: sistemas como el solar maya, el te’lom o las chinampas conservan conocimiento indígena y campesino de cientos de años.',
				cites: ['telom-uaslp', 'chinampas-fao']
			},
			{
				text: 'Agrobiodiversidad: según CONABIO, en México hay 64 razas de maíz, que se mantienen vivas en gran parte gracias a la milpa.',
				cites: ['milpa-ideas']
			},
			{
				text: 'Medios de vida: unos 1,200 millones de personas usan árboles en sus parcelas para obtener alimento e ingresos.',
				cites: ['fao-livelihoods']
			}
		]
	}
];

// ---------------------------------------------------------------------------
// 6. Retos
// ---------------------------------------------------------------------------

export interface Challenge {
	title: string;
	icon: Icon;
	text: Paragraph;
}

export const CHALLENGES_INTRO: Paragraph = {
	text: 'Los SAF son más complejos que un monocultivo. Una revisión de 90 estudios identificó 31 obstáculos para su adopción; estos son los más comunes y cómo tenerlos en cuenta.',
	cites: ['fao-gfs', 'tranchina-2024']
};

export const CHALLENGES: Challenge[] = [
	{
		title: 'Tiempo',
		icon: ClockIcon,
		text: {
			text: 'Los árboles tardan años en dar cosecha. Por eso conviene combinar especies de ciclo corto que generen ingreso desde el inicio (como en la taungya o el MIAF).',
			cites: ['taungya-nal']
		}
	},
	{
		title: 'Conocimiento',
		icon: GraduationCapIcon,
		text: {
			text: 'La falta de conocimiento y experiencia es de las barreras más citadas. Diseñar consorcios, podar y manejar la sombra se aprende con práctica y acompañamiento.',
			cites: ['tranchina-2024', 'iied-barreras']
		}
	},
	{
		title: 'Mano de obra y costos',
		icon: HandHeartIcon,
		text: {
			text: 'El establecimiento puede requerir inversión inicial y más trabajo (siembra, podas, cosechas escalonadas). Las mezclas diversas además son difíciles de mecanizar.',
			cites: ['iied-barreras']
		}
	},
	{
		title: 'Competencia por luz y agua',
		icon: SunIcon,
		text: {
			text: 'Si la densidad o las especies no son adecuadas, los árboles compiten con los cultivos por luz, agua y nutrientes. El exceso de sombra, por ejemplo, reduce la producción de cacao.',
			cites: ['taungya-nal', 'cacao-soconusco']
		}
	},
	{
		title: 'Semillas y plantas',
		icon: PlantIcon,
		text: {
			text: 'No siempre es fácil conseguir semillas o plántulas de calidad de las especies adecuadas para cada zona.',
			cites: ['iied-barreras']
		}
	},
	{
		title: 'Mercados y políticas',
		icon: StorefrontIcon,
		text: {
			text: 'Producir poco de muchas cosas dificulta llegar a mercados; también pesan las políticas poco favorables y la falta de logística para vender.',
			cites: ['iied-barreras']
		}
	}
];

// ---------------------------------------------------------------------------
// 7. Cómo empezar
// ---------------------------------------------------------------------------

export interface Step {
	title: string;
	icon: Icon;
	text: string;
	tips: string[];
	cta?: { label: string; href: string };
}

export const STEPS: Step[] = [
	{
		title: 'Define tus objetivos',
		icon: CompassIcon,
		text: '¿Para qué quieres tu SAF? Autoconsumo, venta, sombra para el ganado, restaurar suelo, proteger un manantial… Los objetivos guían todas las decisiones siguientes.',
		tips: ['Haz una lista de lo que te gustaría cosechar', 'Piensa cuánto tiempo y trabajo puedes dedicarle']
	},
	{
		title: 'Haz un diagnóstico del terreno',
		icon: MagnifyingGlassIcon,
		text: 'Conoce tu parcela antes de sembrar: clima, altitud, lluvias, heladas, tipo de suelo, pendiente, acceso a agua, horas de sol y vegetación que ya existe.',
		tips: [
			'Observa qué especies ya prosperan en la zona',
			'Ubica las curvas a nivel si hay pendiente',
			'Pregunta a vecinos y productores con experiencia'
		]
	},
	{
		title: 'Elige especies por estrato y función',
		icon: TreeIcon,
		text: 'Arma consorcios que ocupen varios estratos (emergente, alto, medio, bajo) y varias etapas de sucesión. Incluye especies productivas y de servicio: fijadoras de nitrógeno, generadoras de biomasa para poda, melíferas y nativas.',
		tips: ['Filtra el catálogo por estrato y zona ecológica', 'Prioriza especies nativas y adaptadas a tu clima'],
		cta: { label: 'Explorar el catálogo de especies', href: '/#catalogo' }
	},
	{
		title: 'Diseña el arreglo y las distancias',
		icon: PencilRulerIcon,
		text: 'Decide dónde va cada planta: líneas o franjas en curvas a nivel en laderas, distancias según el tamaño de la copa adulta, orientación respecto al sol y caminos para trabajar y cosechar.',
		tips: ['Deja espacio para la copa adulta, no para la plántula', 'Pon las especies de más luz donde no den sombra a las demás'],
		cta: { label: 'Diseña tu SAF', href: '/disenador' }
	},
	{
		title: 'Establece por sucesión',
		icon: PlantIcon,
		text: 'Siembra al mismo tiempo especies de placenta, secundarias y de ciclo largo para que unas protejan y alimenten a otras. Mantén el suelo siempre cubierto con materia orgánica.',
		tips: ['Empieza con un área pequeña y crece poco a poco', 'Usa abonos verdes para cubrir y enriquecer el suelo']
	},
	{
		title: 'Maneja con podas',
		icon: ScissorsIcon,
		text: 'La poda abre luz para los estratos de abajo, renueva las plantas y produce materia orgánica que se deja sobre el suelo. Cosecha de forma escalonada y retira solo lo necesario.',
		tips: ['Pica y deja lo podado sobre el suelo como cobertura', 'Poda las especies de servicio antes de que den demasiada sombra']
	},
	{
		title: 'Observa, registra y comparte',
		icon: EyeIcon,
		text: 'Anota qué funciona y qué no: crecimiento, cosechas, plagas, cambios en el suelo. Ajusta el diseño cada temporada y comparte tus experiencias con otras personas.',
		tips: ['Toma fotos del mismo punto cada temporada', 'Comparte tu experiencia en la ficha de cada especie']
	}
];

// ---------------------------------------------------------------------------
// 8. Glosario
// ---------------------------------------------------------------------------

export interface GlossaryTerm {
	term: string;
	definition: string;
}

export const GLOSSARY: GlossaryTerm[] = [
	{
		term: 'Abono verde',
		definition: 'Plantas que se siembran para cortarlas e incorporarlas o dejarlas sobre el suelo, aportando nutrientes y materia orgánica.'
	},
	{ term: 'Biomasa', definition: 'Toda la materia viva o recién muerta (hojas, ramas, raíces) que produce el sistema; al podarla se vuelve abono.' },
	{
		term: 'Cobertura (mulch)',
		definition: 'Capa de material vegetal sobre el suelo que lo protege del sol, la lluvia y la erosión y conserva la humedad.'
	},
	{ term: 'Consorcio', definition: 'Grupo de especies que se siembran juntas porque ocupan estratos y tiempos distintos y se complementan.' },
	{
		term: 'Curvas a nivel',
		definition: 'Líneas que unen puntos de la misma altura en una ladera; sembrar sobre ellas frena el escurrimiento del agua.'
	},
	{ term: 'Dosel', definition: 'Techo formado por las copas de los árboles; su densidad determina cuánta luz llega abajo.' },
	{
		term: 'Especie de servicio',
		definition: 'Planta que se siembra sobre todo por lo que aporta al sistema (biomasa, sombra, nitrógeno, refugio) más que por su cosecha.'
	},
	{ term: 'Estrato', definition: 'Nivel que ocupa una especie en el espacio vertical según la luz que necesita: emergente, alto, medio o bajo.' },
	{
		term: 'Fijación de nitrógeno',
		definition:
			'Capacidad de muchas leguminosas (frijol, guaje, cacahuananche) de tomar nitrógeno del aire, con ayuda de bacterias, y dejarlo disponible en el suelo.'
	},
	{ term: 'Leñosa perenne', definition: 'Planta con tallo de madera que vive varios años: árboles, arbustos, palmas y bambús.' },
	{ term: 'Poda', definition: 'Corte planeado de ramas o plantas para regular la luz, estimular el crecimiento y producir materia orgánica.' },
	{
		term: 'Sucesión',
		definition: 'Proceso natural por el que unas comunidades de plantas van sustituyendo a otras con el tiempo, del suelo desnudo al bosque maduro.'
	}
];

// ---------------------------------------------------------------------------
// 9. Preguntas frecuentes
// ---------------------------------------------------------------------------

export interface Faq {
	question: string;
	answer: Paragraph;
}

export const FAQS: Faq[] = [
	{
		question: '¿Un huerto con algunos árboles ya es un SAF?',
		answer: {
			text: 'Puede serlo si los árboles y los cultivos se combinan a propósito y se benefician entre sí. Los huertos familiares y solares son, de hecho, uno de los SAF más antiguos.',
			cites: ['icraf-definicion', 'huertos-qroo']
		}
	},
	{
		question: '¿Cuánto tarda un SAF en producir?',
		answer: {
			text: 'Depende de las especies. Las de placenta (maíz, frijol, hortalizas) dan cosecha en meses; las secundarias, en uno o pocos años; y los árboles de ciclo largo, en varios años. Por eso se siembran juntas desde el inicio.',
			cites: ['wikifarmer-sintropica']
		}
	},
	{
		question: '¿Necesito mucho terreno?',
		answer: {
			text: 'No. Un solar de unos cuantos metros cuadrados puede ser un SAF muy diverso. Lo importante es aprovechar los estratos y el tiempo, no la extensión.'
		}
	},
	{
		question: '¿Funciona en zonas secas o frías?',
		answer: {
			text: 'Sí, pero las especies y los arreglos cambian. En laderas templadas, por ejemplo, el MIAF usa frutales como el durazno. Elige especies adaptadas a tu zona ecológica y considera cortinas rompevientos y coberturas para conservar humedad.',
			cites: ['miaf-agrociencia']
		}
	},
	{
		question: '¿Qué diferencia hay entre agroforestería y agricultura sintrópica?',
		answer: {
			text: 'La agroforestería es el término general para cualquier combinación intencional de árboles con cultivos o animales. La agricultura sintrópica es un enfoque específico dentro de ella, basado en la sucesión natural, los estratos y la poda.',
			cites: ['fao-gfs', 'andrade-pasini']
		}
	},
	{
		question: '¿Dónde consigo información de cada especie?',
		answer: {
			text: 'En el catálogo de SAF Hub encontrarás estrato, zona ecológica, altura y funciones de cada especie, además de experiencias de cultivo compartidas por la comunidad.'
		}
	}
];

// ---------------------------------------------------------------------------
// 10. Fuentes
// ---------------------------------------------------------------------------

export interface Source {
	id: SourceId;
	title: string;
	publisher: string;
	url: string;
}

export const SOURCES: Source[] = [
	{
		id: 'fao-gfs',
		title: 'Agroforestería — Conjunto de herramientas para la Gestión Forestal Sostenible',
		publisher: 'FAO',
		url: 'https://www.fao.org/sustainable-forest-management/toolbox/modules/agroforestry/basic-knowledge/es/'
	},
	{
		id: 'fao-agroforestry',
		title: 'Agroforestry (página temática)',
		publisher: 'FAO',
		url: 'https://www.fao.org/agroforestry'
	},
	{
		id: 'fao-dg-2023',
		title: 'Agroforestry is a key climate solution, Director-General says at FAO Council side-event',
		publisher: 'FAO Newsroom, 2023',
		url: 'https://www.fao.org/newsroom/detail/agroforestry-is-a-key-climate-solution--director-general-says-at-fao-council-side-event/en'
	},
	{
		id: 'fao-livelihoods',
		title: 'Forests and poverty reduction',
		publisher: 'FAO',
		url: 'https://www.fao.org/forestry-fao/livelihoods/en'
	},
	{
		id: 'icraf-definicion',
		title: 'Definición de agroforestería de ICRAF (World Agroforestry), documento FAO',
		publisher: 'FAO / ICRAF',
		url: 'https://www.fao.org/4/x5812e/x5812e08.htm'
	},
	{
		id: 'leakey-1996',
		title: 'Leakey, R. (1996). Definition of agroforestry revisited. Agroforestry Today',
		publisher: 'ICRAF (registro en AGRIS-FAO)',
		url: 'https://agris.fao.org/search/ar/records/64775aa46dafec353e510071'
	},
	{
		id: 'nair-clasificacion',
		title: 'Agroforestry systems: major types (basado en Nair, 1985, Classification of agroforestry systems)',
		publisher: 'World Agroforestry (ICRAF)',
		url: 'https://apps.worldagroforestry.org/Units/Library/Books/Book%2077/meteorology%20and%20agroforestry/html/agroforestry_sytems_major.htm?n=14'
	},
	{
		id: 'zomer-2016',
		title: 'Zomer, R. J. et al. (2016). Global tree cover and biomass carbon on agricultural land. Scientific Reports 6: 29987',
		publisher: 'Scientific Reports',
		url: 'https://doi.org/10.1038/srep29987'
	},
	{
		id: 'wikifarmer-sintropica',
		title: '¿Qué es la agricultura sintrópica y cómo pueden beneficiarse de ella los agricultores?',
		publisher: 'Wikifarmer',
		url: 'https://wikifarmer.com/library/es/article/que-es-la-agricultura-sintropica-y-como-pueden-beneficiarse-de-ella-los-agricultores'
	},
	{
		id: 'andrade-pasini',
		title: 'Andrade, D. y Pasini, F. What is Syntropic Farming? (Agenda Götsch)',
		publisher: 'Agenda Götsch',
		url: 'https://lavierebelle.org/IMG/pdf/-_dayana_andrade_felipe_pasini_-_article_-_what_is_syntropic_farming.pdf'
	},
	{
		id: 'miaf-gob',
		title: 'Milpa Intercalada con Árboles Frutales (MIAF)',
		publisher: 'Gobierno de México',
		url: 'https://www.gob.mx/cms/uploads/attachment/file/558705/MIAF.pdf'
	},
	{
		id: 'miaf-agrociencia',
		title: 'Artículo sobre el sistema MIAF en Agrociencia (INIFAP y Colegio de Postgraduados)',
		publisher: 'Agrociencia / Redalyc',
		url: 'https://www.redalyc.org/journal/573/57364776003/57364776003.pdf'
	},
	{
		id: 'miaf-colpos',
		title: 'Casos de éxito: Milpa Intercalada con Árboles Frutales',
		publisher: 'Colegio de Postgraduados, 2021',
		url: 'https://www.colpos.mx/cp_pdf/casos-de-exito/2021/cde_diciembre2021.pdf'
	},
	{
		id: 'sembrando-vida-2026',
		title: 'Sembrando Vida potencia 16 cultivos',
		publisher: 'La Crónica de Hoy, 2026',
		url: 'https://www.cronica.com.mx/nacional/2026/05/16/sembrando-vida-potencia-16-cultivos/'
	},
	{
		id: 'milpa-ideas',
		title: 'El sistema milpa en México (cita datos de CONABIO)',
		publisher: 'IDEASS',
		url: 'https://www.ideassonline.org/public/pdf/Milpa-2-SystemMexico2022_2-ESP.pdf'
	},
	{
		id: 'huertos-qroo',
		title: 'Kantún-Balam, J. et al. (2013). Huertos familiares de Quintana Roo',
		publisher: 'CICY, repositorio institucional',
		url: 'https://cicy.repositorioinstitucional.mx/jspui/bitstream/1003/1261/1/id27402_Kantun_Jesus.pdf'
	},
	{
		id: 'cafetales-aves',
		title: 'Sistemas cafetaleros bajo sombra y biodiversidad en México',
		publisher: 'Redalyc',
		url: 'https://www.redalyc.org/journal/756/75643504003/75643504003.pdf'
	},
	{
		id: 'cacao-soconusco',
		title: 'Árboles de sombra en sistemas agroforestales de cacao (Soconusco, Chiapas)',
		publisher: 'Redalyc',
		url: 'https://www.redalyc.org/journal/437/43759027003/43759027003.pdf'
	},
	{
		id: 'telom-fao',
		title: 'Bibliografía anotada sobre manejo forestal comunitario (Alcorn, 1984: te’lom huasteco)',
		publisher: 'FAO',
		url: 'https://www.fao.org/4/u9040e/U9040E15.htm'
	},
	{
		id: 'telom-uaslp',
		title: 'Estudio sobre el te’lom en la Huasteca Potosina',
		publisher: 'Universidad Autónoma de San Luis Potosí',
		url: 'https://ninive.uaslp.mx/xmlui/handle/i/5674'
	},
	{
		id: 'chinampas-fao',
		title: 'Chinampas de la Ciudad de México, Sistema Importante del Patrimonio Agrícola Mundial',
		publisher: 'FAO en México',
		url: 'https://fao.org/mexico/noticias/detail-events/es/c/1256562'
	},
	{
		id: 'silvopastoril-tabasco',
		title: 'Sistemas silvopastoriles tradicionales en la Sierra de Tabasco',
		publisher: 'Redalyc',
		url: 'https://www.redalyc.org/journal/837/83769081018/83769081018.pdf'
	},
	{
		id: 'silvopastoril-colpos',
		title: 'Sistemas silvopastoriles',
		publisher: 'Colegio de Postgraduados, Campus Veracruz',
		url: 'https://www.colpos.mx/cp_pdf/campus/campus-veracruz/publicaciones/sistemas_silvopastoriles.pdf'
	},
	{
		id: 'cercas-vivas-rbt',
		title: 'Cercas vivas en sistemas de producción tropicales: una revisión mundial de los usos y percepciones',
		publisher: 'Revista de Biología Tropical',
		url: 'https://revistas.ucr.ac.cr/index.php/rbt/article/view/33405'
	},
	{
		id: 'taungya-nal',
		title: 'Taungya (definición del tesauro agrícola)',
		publisher: 'USDA National Agricultural Library',
		url: 'https://lod.nal.usda.gov/nalt/es/page/130727'
	},
	{
		id: 'iied-barreras',
		title: 'Implantación de la agroforestería: estrategias de los pequeños agricultores para superar las barreras a la adopción',
		publisher: 'IIED / FAO, 2025',
		url: 'https://www.iied.org/es/22677iied'
	},
	{
		id: 'tranchina-2024',
		title: 'Tranchina, M. et al. (2024). Revisión sistemática de los obstáculos para adoptar la agroforestería. Agroforestry Systems',
		publisher: 'Springer',
		url: 'https://link.springer.com/10.1007/s10457-024-00993-w'
	}
];

export const SOURCE_INDEX: Record<SourceId, number> = SOURCES.reduce(
	(acc, source, index) => ({ ...acc, [source.id]: index + 1 }),
	{} as Record<SourceId, number>
);
