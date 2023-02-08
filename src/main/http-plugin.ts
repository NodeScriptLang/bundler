import { Plugin, PluginBuild } from 'esbuild';

export const esbuildHttpPlugin: Plugin = {
    name: 'http',
    setup(build: PluginBuild) {
        build.onResolve({ filter: /^https?:\/\// }, args => {
            if (args.kind === 'dynamic-import') {
                return {
                    path: args.path,
                    external: true,
                };
            }
            return {
                path: args.path,
                namespace: 'http-url',
            };
        });
        build.onResolve({ filter: /.*/, namespace: 'http-url' }, args => {
            return {
                path: new URL(args.path, args.importer).toString(),
                namespace: 'http-url',
            };
        });
        build.onLoad({ filter: /.*/, namespace: 'http-url' }, async args => {
            const res = await fetch(args.path);
            if (!res.ok) {
                throw new BundleFailedError(`Bundle failed: ${res.status} GET ${args.path}`);
            }
            const contents = await res.text();
            return {
                contents,
            };
        });
    },
};

export class BundleFailedError extends Error {
    override name = this.constructor.name;
}
