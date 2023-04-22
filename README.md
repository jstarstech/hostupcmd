# HostUpCmd

HostUpCmd is a tool to execute a command on the host up or down is detected.

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

Configuration file ***config.json***.

All configuration properties:

| Property        | Default | Description                                                             |
|:----------------|:-------:|:------------------------------------------------------------------------|
| hosts           |   []    | Array of ***Host*** objects  [ ***required*** ]                         |
| defaultInterval |  10000  | Default interval between ping probe in milliseconds. [ ***optional*** ] |

***Host*** object:

| Property | Default | Description                                                                 |
|:---------|:-------:|:----------------------------------------------------------------------------|
| host     |   ""    | Domain or ip address of monitored host   [ ***required*** ]                 |
| cmdUp    |   ""    | A command to execute when host probe detect host is down [ ***required*** ] |
| cmdDown  |   ""    | A command to execute when host probe detect host is up   [ ***required*** ] |
