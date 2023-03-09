import { bundleCode } from './bundle.js';

/**
 * Creates a Node.js process wrapper of specified moduleUrl.
 * The inputs are read from stdin which expects a utf8-encoded JSON.
 * The output is written to stdout.
 *
 * Note: this bundler requires `@nodescript/core` installed, which is also bundled.
 */
export async function bundleModuleGcfWrapper(moduleUrMjs: string) {
    const compute = await import(moduleUrMjs);
    const buffer = [
        `import { GraphEvalContext } from '@nodescript/core/runtime';`,
        compute,
        nodeJsStdioTemplate
    ].join('\n');
    return await bundleCode(buffer);
}

const nodeJsStdioTemplate = `
try {
    const input = [];
    for await (const chunk of process.stdin) {
        input.push(chunk);
    }
    const buf = Buffer.concat(input);
    const json = JSON.parse(buf.toString('utf-8'));
    const ctx = new GraphEvalContext();
    const res = await compute(json, ctx);
    process.stdout.write(JSON.stringify(res || ''));
    process.exit(0);
} catch (error) {
    process.stderr.write(JSON.stringify({
        name: 'EvaluationFailed',
        message: error.message,
    }));
    process.exit(1);
}
`;
