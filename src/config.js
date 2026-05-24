import Ajv from 'ajv';
import { readFileSync } from 'fs';

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

    init() {
        try {
            const configString = readFileSync('./config.json', 'utf8');

            this.configObj = JSON.parse(configString);

            const validate = ajv.compile(this.schema);
            const valid = validate(this.configObj);

            if (!valid) {
                console.log('Config error:', validate.errors);
                process.exit(1);
            }
        } catch (e) {
            console.log('Config error:', e.toString());
            process.exit(1);
        }
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
