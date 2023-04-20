const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const ping = require('ping');

const hostsCmd = {
    '192.168.99.15': [
        {
            cmdMount: 'net use N: \\\\192.168.99.15\\keyn keyn',
            cmdUnmount: 'net use N: /delete',
            state: 0
        },
        {
            cmdMount: 'net use L: \\\\192.168.99.15\\web web',
            cmdUnmount: 'net use L: /delete',
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
                    console.log('exec error: ' + stderr);
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
