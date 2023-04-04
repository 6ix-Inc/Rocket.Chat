import WS from 'jest-websocket-mock';
import { WebSocket } from 'ws';

import { MinimalDDPClient } from '../src/MinimalDDPClient';
import { ConnectionImpl } from '../src/Connection';

let server: WS;
beforeEach(() => {
	server = new WS('ws://localhost:1234');
});

afterEach(() => {
	server.close();
	WS.clean();
});

it('should connect', async () => {
	const ws = new WebSocket('ws://localhost:1234');
	const client = new MinimalDDPClient(ws.send.bind(ws));
	const connection = new ConnectionImpl(ws as unknown as globalThis.WebSocket, client, { retryCount: 0, retryTime: 0 });

	ws.onmessage = (event) => {
		client.handleMessage(String(event.data));
	};

	server.nextMessage.then((message) => {
		expect(message).toBe('{"msg":"connect","version":"1","support":["1","pre2","pre1"]}');
		server.send('{"msg":"connected","session":"123"}');
	});

	expect(connection.status).toBe('idle');
	expect(connection.session).toBeUndefined();

	await expect(connection.connect()).resolves.toBe(true);

	expect(connection.session).toBe('123');
	expect(connection.status).toBe('connected');
});

it('should handle a failing connection', async () => {
	const ws = new WebSocket('ws://localhost:1234');
	const client = new MinimalDDPClient(ws.send.bind(ws));
	const connection = new ConnectionImpl(ws as unknown as globalThis.WebSocket, client, { retryCount: 0, retryTime: 0 });

	const suggestedVersion = '1';

	ws.onmessage = (event) => {
		client.handleMessage(String(event.data));
	};

	server.nextMessage.then((message) => {
		expect(message).toBe('{"msg":"connect","version":"1","support":["1","pre2","pre1"]}');
		server.send(`{"msg":"failed","version":"${suggestedVersion}"}`);
	});

	expect(connection.status).toBe('idle');
	expect(connection.session).toBeUndefined();

	await expect(connection.connect()).rejects.toBe(suggestedVersion);

	expect(connection.session).toBeUndefined();
	expect(connection.status).toBe('failed');
});

it('should trigger a disconnect callback', async () => {
	const ws = new WebSocket('ws://localhost:1234');
	const client = new MinimalDDPClient(ws.send.bind(ws));
	const connection = new ConnectionImpl(ws as unknown as globalThis.WebSocket, client, { retryCount: 0, retryTime: 0 });

	ws.onmessage = (event) => {
		client.handleMessage(String(event.data));
	};
	const suggestedVersion = '1';

	const s = server.nextMessage.then((message) => {
		expect(message).toBe(`{"msg":"connect","version":"${suggestedVersion}","support":["1","pre2","pre1"]}`);
		return server.send('{"msg":"connected","session":"123"}');
	});

	expect(connection.status).toBe('idle');
	expect(connection.session).toBeUndefined();

	const disconnectCallback = jest.fn();
	connection.on('connection', disconnectCallback);
	const connectionPromise = connection.connect();

	await s;

	await expect(connectionPromise).resolves.toBe(true);

	expect(disconnectCallback).toHaveBeenNthCalledWith(1, 'connecting');
	expect(disconnectCallback).toHaveBeenNthCalledWith(2, 'connected');
	expect(disconnectCallback).toBeCalledTimes(2);

	server.close();

	expect(disconnectCallback).toBeCalledTimes(3);
	expect(disconnectCallback).toHaveBeenNthCalledWith(3, 'disconnected');

	expect(connection.status).toBe('disconnected');
});
