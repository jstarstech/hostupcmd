import util from 'node:util';
import child_process from 'node:child_process';
import ping from 'ping';
import { getConfig } from './config.js';

const exec = util.promisify(child_process.exec);

const hostsCmd = {};

async function check() {
    for (const [host, cmds] of Object.entries(hostsCmd)) {
        const isAlive = await ping.promise.probe(host);

        console.log(`Host ${host} is ${isAlive ? 'up' : 'down'}`);

        for (const cmd of cmds) {
            let cmdToExec = '';

            if (isAlive && cmd.state === 0) {
                cmdToExec = cmd.cmdUp;
                cmd.state = 1;
            } else {
                cmdToExec = cmd.cmdDown;
                cmd.state = 0;
            }

            if (cmdToExec === '') {
                return;
            }

            try {
                const { stderr } = await exec(cmdToExec);

                if (stderr !== '') {
                    console.log(`exec error: ${stderr}`);
                }
            } catch (e) {
                console.log(`Error executing command "${cmdToExec}": ${e.toString()}`);
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
            state: 0,
        });
    }

    await check();

    setInterval(check, getConfig('defaultInterval') || 10000);
})();
