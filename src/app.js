import util from 'node:util';
import child_process from 'node:child_process';
import ping from 'ping';
import { getConfig } from './config.js';

const exec = util.promisify(child_process.exec);

const hostsCmd = Object.create(null);

async function check() {
    for (const [host, cmds] of Object.entries(hostsCmd)) {
        const isAlive = (await ping.promise.probe(host)).alive;

        console.log(`Host ${host} is ${isAlive ? 'up' : 'down'}`);

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
                const { stderr } = await exec(cmdToExec);

                if (stderr !== '') {
                    console.log(`exec error: ${stderr}`);
                }
            } catch (e) {
                console.log(
                    `Error executing command "${cmdToExec}": ${e.toString()}`
                );
            }
        }
    }
}

(async () => {
    const hosts = getConfig('hosts');

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

    await check();

    setInterval(check, getConfig('defaultInterval') ?? 10000);
})();
