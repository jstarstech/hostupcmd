import assert from 'node:assert/strict';
import test from 'node:test';
import { check, createHostRegistry, run } from '../src/app.js';

test('state change only triggers once for the same host state', async () => {
    const hostsCmd = createHostRegistry([
        {
            host: 'localhost',
            cmdUp: 'echo up',
            cmdDown: 'echo down',
        },
    ]);

    const execCalls = [];

    async function probeHost() {
        return { alive: true };
    }

    async function execCommand(command) {
        execCalls.push(command);

        return { stderr: '' };
    }

    await check(hostsCmd, {
        probeHost,
        execCommand,
        logger() {},
    });

    await check(hostsCmd, {
        probeHost,
        execCommand,
        logger() {},
    });

    assert.deepEqual(execCalls, ['echo up']);
    assert.equal(hostsCmd.localhost[0].state, 1);
});

test('check handles stderr output, execution errors, and empty commands', async () => {
    const hostsCmd = createHostRegistry([
        {
            host: 'alpha',
            cmdUp: '',
            cmdDown: 'echo down',
        },
        {
            host: 'beta',
            cmdUp: 'echo beta',
            cmdDown: 'echo down',
        },
        {
            host: 'gamma',
            cmdUp: 'echo gamma',
            cmdDown: 'echo down',
        },
    ]);

    const logs = [];
    const execCalls = [];

    await check(hostsCmd, {
        probeHost: async () => ({ alive: true }),
        execCommand: async (command) => {
            execCalls.push(command);

            if (command === 'echo beta') {
                return { stderr: 'warn' };
            }

            if (command === 'echo gamma') {
                throw new Error('boom');
            }

            return { stderr: '' };
        },
        logger: (message) => logs.push(message),
    });

    assert.deepEqual(execCalls, ['echo beta', 'echo gamma']);
    assert.equal(hostsCmd.alpha[0].state, 1);
    assert.equal(hostsCmd.beta[0].state, 1);
    assert.equal(hostsCmd.gamma[0].state, 1);
    assert.match(logs.join('\n'), /Host alpha is up/);
    assert.match(logs.join('\n'), /exec error: warn/);
    assert.match(
        logs.join('\n'),
        /Error executing command "echo gamma": Error: boom/
    );
});

test('run reads hosts and schedules repeated checks', async () => {
    const hosts = [
        {
            host: 'localhost',
            cmdUp: 'echo up',
            cmdDown: 'echo down',
        },
    ];

    let scheduledInterval;
    let scheduledCallback;
    let pollCount = 0;

    await run({
        getHosts: () => hosts,
        getInterval: () => 2500,
        poll: async (hostsCmd) => {
            pollCount += 1;
            assert.equal(hostsCmd.localhost[0].cmdUp, 'echo up');
        },
        schedule: (callback, interval) => {
            scheduledCallback = callback;
            scheduledInterval = interval;
        },
    });

    assert.equal(pollCount, 1);
    assert.equal(scheduledInterval, 2500);
    assert.equal(typeof scheduledCallback, 'function');
});
