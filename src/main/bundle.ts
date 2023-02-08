import { build, Loader } from 'esbuild';

import { esbuildHttpPlugin } from './http-plugin.js';

/**
 * Bundles ESM code, typically produced by GraphCompiler.
 * All non-dynamic `https:` imports are resolved and bundled.
 */
export async function bundleCode(code: string, loader: Loader = 'js') {
    const res = await build({
        bundle: true,
        stdin: {
            resolveDir: process.cwd(),
            loader,
            contents: code,
        },
        write: false,
        minify: true,
        keepNames: true,
        format: 'esm',
        plugins: [
            esbuildHttpPlugin
        ]
    });
    return res.outputFiles[0].text;
}

/**
 * Bundles a source file (typically written in TS) into a compute function.
 * All non-dynamic relative and http imports are resolved and bundled.
 */
export async function bundleModuleCompute(file: string, cwd = process.cwd()) {
    const loader: Loader = /\.ts/i.test(file) ? 'ts' : 'js';
    const res = await build({
        bundle: true,
        stdin: {
            resolveDir: cwd,
            loader,
            contents: [
                `import { compute } from ${JSON.stringify('./' + file)};`,
                `export { compute };`,
            ].join('\n'),
        },
        write: false,
        minify: true,
        keepNames: true,
        format: 'esm',
        plugins: [
            esbuildHttpPlugin,
        ]
    });
    return res.outputFiles[0].text;
}

/**
 * Bundles a source file (typically written in TS) into a single `export { module }`
 * which can be used to evaluate ModuleSpec.
 */
export async function bundleModuleJson(file: string, cwd = process.cwd()) {
    const loader: Loader = /\.ts/i.test(file) ? 'ts' : 'js';
    const res = await build({
        bundle: true,
        stdin: {
            resolveDir: cwd,
            loader,
            contents: [
                `import { module } from ${JSON.stringify('./' + file)};`,
                `export { module };`,
            ].join('\n'),
        },
        write: false,
        minify: true,
        keepNames: true,
        format: 'esm',
    });
    return res.outputFiles[0].text;
}
