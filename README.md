# HostUpCmd

HostUpCmd is a tool to execute a command when a host is detected as up or down.

## Installation and Usage

Clone repository and install dependencies:

```shell
$ git clone https://github.com/jstarstech/hostupcmd
$ cd hostupcmd
$ npm install
```

Copy an example configuration file and edit it for your needs:

```shell
$ cp config.json.example config.json
```

Run application:

```shell
$ npm start
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
