import type { NitroModule } from "nitro/types";

// Nitro's prerenderer is a standalone rolldown build (`nitro-prerender` preset)
// that cannot run yamf's vite plugins, so `virtual:yamf:*` modules, the islands
// transform, and the vite asset manifests do not exist there. Its auto-detected
// serverEntry (src/server.tsx) would be bundled by rolldown and crash the
// worker at init (`Received protocol 'virtual:'`). Disabling it lets prerender
// requests fall through to the inherited renderer — nitro's vite ssr-renderer —
// which dispatches them into the vite-built ssr service bundle: the exact code
// path the production server uses.
export const prerenderModule: NitroModule = {
	name: "yamf:prerender",
	setup(nitro) {
		nitro.hooks.hook("prerender:config", config => {
			config.serverEntry = false;
		});

		nitro.hooks.hook("prerender:generate", route => {
			// static hosts (github-pages & friends) expect the not-found document
			// at exactly /404.html; nitro would write /404 as 404/index.html
			// (autoSubfolderIndex)
			if (route.route === "/404" && !route.error && !route.skip) {
				route.fileName = "404.html";
			}
		});
	},
};
