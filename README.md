# HostUpCmd

HostUpCmd is a tool to monitor hosts and run commands when their state changes.

<p align="">
  <a href="https://www.npmjs.com/package/hostupcmd"><img src="https://img.shields.io/npm/v/hostupcmd?style=for-the-badge" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/package/hostupcmd"><img src="https://img.shields.io/npm/l/hostupcmd?style=for-the-badge" alt="MIT License" /></a>
  <a href="https://github.com/jstarstech/hostupcmd"><img src="https://img.shields.io/badge/github-repo-blue?logo=github&style=for-the-badge" alt="Build status" /></a>
</p>

## Usage

Run without installing globally:

```shell
$ npx hostupcmd
```

Or install globally from npm:

```shell
$ npm install -g hostupcmd
```

Or run with Docker from GHCR:

```shell
$ docker run --rm -it \
  -v "$PWD/config.json:/app/config.json:ro" \
  ghcr.io/jstarstech/hostupcmd:latest
```

Create a config file in the directory where you run the command:

```shell
$ cp "$(npm root -g)/hostupcmd/config.json.example" ./config.json
```

Run application:

```shell
$ hostupcmd
```

## Configuration

The configuration file is named **_config.json_**.

All configuration properties:

| Property        | Default | Description                                                              |
| :-------------- | :-----: | :----------------------------------------------------------------------- |
| hosts           |   []    | Array of **_Host_** objects. [ ***required*** ]                          |
| defaultInterval |  10000  | Default interval between ping probes in milliseconds. [ ***optional*** ] |

**_Host_** object:

| Property | Default | Description                                                              |
| :------- | :-----: | :----------------------------------------------------------------------- |
| host     |   ""    | Domain or IP address of the monitored host. [ ***required*** ]           |
| cmdUp    |   ""    | Command to execute when the host is detected as up. [ ***required*** ]   |
| cmdDown  |   ""    | Command to execute when the host is detected as down. [ ***required*** ] |

## Development

Run from a clone:

```shell
git clone https://github.com/jstarstech/hostupcmd
cd hostupcmd
npm install
cp config.json.example config.json
npm start
```
