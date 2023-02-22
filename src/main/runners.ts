import { bundleCode } from './bundle.js';

/**
 * Creates a Node.js process runner of specified moduleUrl.
 * The inputs are read from stdin which expects a utf8-encoded JSON.
 * The output is writted to stdout.
 *
 * Note: this bundler requires `@nodescript/core` installed, which is also bundled.
 */
export async function bundleNodeJsStdioRunner(moduleCode: string) {
    const buffer = [
        `import { GraphEvalContext } from '@nodescript/core/runtime';`,
        moduleCode,
        nodeJsStdioTemplate,
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
} catch (error) {
    process.stderr.write(JSON.stringify({
        name: 'EvaluationFailed',
        message: error.message,
    }));
}
`;
