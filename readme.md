## Wormhole js client


### Usage

```
const client = new Wormhole.default(connectionUrl: string, options: WormholeClientOptions)
```

```
interface WormholeClientOptions {
    connectionOptions: WebsocketConnectionOptions;
}

interface WebsocketConnectionOptions {
    reconnect: boolean = true;
    maxReconnects: number = Infinity;
    reconnectTimeout: number = 1000;
}
```

### Example

```
const client = new Wormhole('ws://localhost:7532', {
    connectionOptions: {
        reconnect: true,
        maxReconnects: 5
    }
});
```

### Server connect

```
client.connect()
    .on('connect', () => {
        console.log('connection established');
    })
    .on('disconnect', () => {
        console.log('connection lost');
    })
    .on('error', () => {
        console.log('connection error');
    })
```

### Send server request

#### Use promise

```
client.remote.Greeter.Hello({
    Message: "test",
    CallableRef: () => {
        console.log("CallableRef");
    },
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
}).finally(() => {
    console.log("call end");
});
```

#### Use async

```
try {
    const payload = {
        Message: "test",
        CallableRef: () => {
            console.log("CallableRef");
        },
    };

    const result = await client.remote.Greeter.Hello(payload);
    console.log("result", result);
} catch (error) {
    console.log(error);
}
```

#### Send metadata

```
client.remote.Greeter.Hello(payload, metadata);
```

##### Example

```
client.remote.Greeter.Hello({
    Message: "test",
}, {
    Authorization: "JWT ...",
});
```


### Use in typescript

```
const client = new WormholeClient(options);

try {
    const result = await client.remote.Greeter.Hello({
        Message: "test",
    });
} catch (error) {
    console.log("error", error);
}
```
