import Ajv from 'ajv';
import {readFileSync} from 'fs';

const ajv = new Ajv();

export default class Config {
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
                            type: 'string'
                        },
                        cmdMount: {
                            type: 'string'
                        },
                        cmdUnmount: {
                            type: 'string'
                        }
                    },
                    required: ['host', 'cmdMount', 'cmdUnmount'],
                    additionalProperties: false
                }
            }
        },
        required: ['hosts'],
        additionalProperties: false
    };

    init() {
        try {
            const configString = readFileSync('./config.json', 'utf8');

            this.configObj = JSON.parse(configString);


            const validate = ajv.compile(this.schema)
            const valid = validate(this.configObj)
            if (!valid) {
                console.log(validate.errors)
            }
        } catch (e) {
            console.log(e.toString())
            process.exit(1);
        }
    }

    get(property, configObj = undefined) {
        const elems = Array.isArray(property) ? property : property.split('.');
        const name = elems[0];

        let value

        if (configObj === undefined) {
            value = this.configObj[name];
        } else {
            value = configObj[name];
        }

        if (elems.length <= 1) {
            return value;
        }

        if (value === null || typeof value !== 'object' || !Array.isArray(value)) {
            return undefined;
        }

        return this.get(elems.slice(1), value);
    }
}

let conf;

export function getConfig(path) {
    if (!conf) {
        conf = new Config();

        conf.init();
    }

    return conf.get(path)
}

