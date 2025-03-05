import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: false,
			strict: false
		}),
		paths: {
			base: "/my-portfolio", // 🔥 Replace with your actual GitHub repo name!
		},
		appDir: "app",
	}
};

export default config;
