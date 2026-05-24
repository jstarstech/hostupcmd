import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { loadConfig } from '../src/config.js';

const rootDir = process.cwd();

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

test('getConfig reads values from disk', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hostupcmd-config-'));
    const configPath = join(tempDir, 'config.json');
    const previousCwd = process.cwd();

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

        process.chdir(tempDir);

        const module = await import(
            new URL(`../src/config.js?case=${Date.now()}`, import.meta.url)
        );

        assert.deepEqual(module.getConfig('hosts'), [
            {
                host: 'localhost',
                cmdUp: 'echo up',
                cmdDown: 'echo down',
            },
        ]);
        assert.equal(module.getConfig('defaultInterval'), 2500);
    } finally {
        process.chdir(previousCwd);
        rmSync(tempDir, { recursive: true, force: true });
    }
});

test('cli exits with config error on invalid configuration', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'hostupcmd-cli-'));
    const configPath = join(tempDir, 'config.json');
    const appPath = join(rootDir, 'src', 'app.js');

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

        const result = spawnSync(process.execPath, [appPath], {
            cwd: tempDir,
            encoding: 'utf8',
        });

        assert.notEqual(result.status, 0);
        assert.match(`${result.stdout}${result.stderr}`, /Config error:/);
    } finally {
        rmSync(tempDir, { recursive: true, force: true });
    }
});
