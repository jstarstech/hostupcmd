import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { loadConfig } from '../src/config.js';

test('config validation fails when required host fields are missing', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hostupcmd-config-'));
    const configPath = join(tempDir, 'config.json');

    try {
        writeFileSync(
            configPath,
            JSON.stringify(
                {
                    hosts: [
                        {
                            host: 'localhost',
                        },
                    ],
                },
                null,
                2
            )
        );

        assert.throws(() => loadConfig(configPath), /Config error:/);
    } finally {
        rmSync(tempDir, { recursive: true, force: true });
    }
});

test('config parsing fails on malformed json', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hostupcmd-config-'));
    const configPath = join(tempDir, 'config.json');

    try {
        writeFileSync(configPath, '{');

        assert.throws(() => loadConfig(configPath), /Config error:/);
    } finally {
        rmSync(tempDir, { recursive: true, force: true });
    }
});

test('getConfig reads values from disk', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hostupcmd-config-'));
    const configPath = join(tempDir, 'config.json');

    try {
        writeFileSync(
            configPath,
            JSON.stringify(
                {
                    hosts: [
                        {
                            host: 'localhost',
                            cmdUp: 'echo up',
                            cmdDown: 'echo down',
                        },
                    ],
                    defaultInterval: 2500,
                },
                null,
                2
            )
        );

        assert.deepEqual(loadConfig(configPath), {
            hosts: [
                {
                    host: 'localhost',
                    cmdUp: 'echo up',
                    cmdDown: 'echo down',
                },
            ],
            defaultInterval: 2500,
        });
    } finally {
        rmSync(tempDir, { recursive: true, force: true });
    }
});

test('cli exits with config error on invalid configuration', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hostupcmd-cli-'));
    const configPath = join(tempDir, 'config.json');
    const appPath = new URL('../src/app.js', import.meta.url).href;

    try {
        writeFileSync(
            configPath,
            JSON.stringify(
                {
                    hosts: [
                        {
                            host: 'localhost',
                        },
                    ],
                },
                null,
                2
            )
        );

        const result = spawnSync(
            process.execPath,
            [
                '--input-type=module',
                '-e',
                `import { run } from ${JSON.stringify(appPath)}; await run();`,
            ],
            {
                cwd: tempDir,
                encoding: 'utf8',
            }
        );

        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /Config error:/);
    } finally {
        rmSync(tempDir, { recursive: true, force: true });
    }
});
