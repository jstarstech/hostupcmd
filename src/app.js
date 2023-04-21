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
                cmdToExec = cmd.cmdMount;
                cmd.state = 1;
            } else {
                cmdToExec = cmd.cmdUnmount;
                cmd.state = 0;
            }

            try {
                const { stderr } = await exec(cmdToExec);

                if (stderr !== null) {
                    console.log(`exec error: ${stderr}`);
                }
            } catch (e) {
                console.log(e.toString());
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
            cmdMount: host.cmdMount,
            cmdUnmount: host.cmdUnmount,
            state: 0,
        });
    }

    await check();

    setInterval(check, 10000);
})();
