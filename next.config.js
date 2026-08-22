/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	output: 'export',
	// Emite cada ruta como carpeta/index.html (en vez de carpeta.html) para que
	// servidores estáticos "planos" (Apache/Nginx en Plesk, S3, etc.) puedan
	// resolver /signin, /species, etc. sirviendo el index.html de esa carpeta,
	// sin depender de reglas de reescritura como las de Firebase Hosting (cleanUrls).
	trailingSlash: true
};

module.exports = nextConfig;
