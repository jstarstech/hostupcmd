import Ajv from 'ajv';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ajv = new Ajv();

class Config {
    configObj = {};
    schema = {
        type: 'object',
        properties: {
            hosts: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        host: {
                            type: 'string',
                        },
                        cmdUp: {
                            type: 'string',
                        },
                        cmdDown: {
                            type: 'string',
                        },
                    },
                    required: ['host', 'cmdUp', 'cmdDown'],
                    additionalProperties: false,
                },
            },
            defaultInterval: {
                type: 'number',
            },
        },
        required: ['hosts'],
        additionalProperties: false,
    };

    init(configPath = join(process.cwd(), 'config.json')) {
        try {
            const configString = readFileSync(configPath, 'utf8');

            this.configObj = JSON.parse(configString);

            const validate = ajv.compile(this.schema);
            const valid = validate(this.configObj);

            if (!valid) {
                throw new Error(`Config error: ${JSON.stringify(validate.errors)}`);
            }
        } catch (e) {
            if (e instanceof Error && e.message.startsWith('Config error:')) {
                throw e;
            }

            throw new Error(`Config error: ${e.toString()}`);
        }

        return this.configObj;
    }

    get(property) {
        return this.configObj[property];
    }
}

let conf;

export function getConfig(path) {
    if (!conf) {
        conf = new Config();

        conf.init();
    }

    return conf.get(path);
}

export function loadConfig(configPath = join(process.cwd(), 'config.json')) {
    const conf = new Config();

    return conf.init(configPath);
}
