#!/usr/bin/env node

import util from 'node:util';
import child_process from 'node:child_process';
import { pathToFileURL } from 'node:url';
import ping from 'ping';
import { getConfig } from './config.js';

const exec = util.promisify(child_process.exec);

export function createHostRegistry(hosts) {
    const hostsCmd = Object.create(null);

    for (const host of hosts) {
        if (!hostsCmd[host.host]) {
            hostsCmd[host.host] = [];
        }

        hostsCmd[host.host].push({
            cmdUp: host.cmdUp,
            cmdDown: host.cmdDown,
            state: undefined,
        });
    }

    return hostsCmd;
}

export async function check(hostsCmd, {
    probeHost = ping.promise.probe,
    execCommand = exec,
    logger = console.log,
} = {}) {
    for (const [host, cmds] of Object.entries(hostsCmd)) {
        const isAlive = (await probeHost(host)).alive;

        logger(`Host ${host} is ${isAlive ? 'up' : 'down'}`);

        for (const cmd of cmds) {
            const nextState = isAlive ? 1 : 0;

            if (cmd.state === nextState) {
                continue;
            }

            const cmdToExec = isAlive ? cmd.cmdUp : cmd.cmdDown;

            cmd.state = nextState;

            if (cmdToExec === '') {
                continue;
            }

            try {
                const { stderr } = await execCommand(cmdToExec);

                if (stderr !== '') {
                    logger(`exec error: ${stderr}`);
                }
            } catch (e) {
                logger(
                    `Error executing command "${cmdToExec}": ${e.toString()}`
                );
            }
        }
    }
}

export async function run({
    getHosts = () => getConfig('hosts'),
    getInterval = () => getConfig('defaultInterval') ?? 10000,
    schedule = setInterval,
    poll = check,
} = {}) {
    const hostsCmd = createHostRegistry(getHosts());

    await poll(hostsCmd);

    schedule(() => {
        void poll(hostsCmd);
    }, getInterval());
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
    void run().catch((error) => {
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    });
}
