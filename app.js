import util from 'node:util';
import child_process from 'node:child_process';
import ping from 'ping';

const exec = util.promisify(child_process.exec);

const hostsCmd = {
    '192.168.99.1': [
        {
            cmdMount: 'net use L: \\\\192.168.99.1\\backup backup',
            cmdUnmount: 'net use L: /delete',
            state: 0
        }
    ],
    '192.168.99.15': [
        {
            cmdMount: 'net use L: \\\\192.168.99.15\\web web',
            cmdUnmount: 'net use M: /delete',
            state: 0
        }
    ],
};

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
                const {stdout, stderr} = await exec(cmdToExec);

                if (stderr !== null) {
                    console.log(`exec error: ${stderr}`);
                }
            } catch (e) {
                console.log(e.toString())
            }
        }
    }
}

(async () => {
    await check();

    setInterval(check, 10000);
})();
