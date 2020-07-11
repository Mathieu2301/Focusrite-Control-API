const net = require('net');
const _ = (msg) => 'Length=' + ('000000' + msg.length.toString(16)).substr(-6) + ' ' + msg;

module.exports = {

  requests: {
    A1_PREAMP_TRUE: `<set devid="1"><item id="23" value="true"/></set>`,
    A1_PREAMP_FALSE: `<set devid="1"><item id="23" value="false"/></set>`,
  
    A2_INST_TRUE: `<set devid="1"><item id="28" value="Inst"/></set>`,
    A2_INST_FALSE: `<set devid="1"><item id="28" value="Line"/></set>`,
  
    MODE_COLOR: `<set devid="1"><item id="43" value="true"/></set>`,
    MODE_NORMAL: `<set devid="1"><item id="43" value="false"/></set>`,
  },

  colors: {
    COLOR_RED: `<set devid="1"><item id="44" value="red"/></set>`,
    COLOR_AMBER: `<set devid="1"><item id="44" value="amber"/></set>`,
    COLOR_GREEN: `<set devid="1"><item id="44" value="green"/></set>`,
    COLOR_LIGHT_BLUE: `<set devid="1"><item id="44" value="light blue"/></set>`,
    COLOR_BLUE: `<set devid="1"><item id="44" value="blue"/></set>`,
    COLOR_LIGHT_PINK: `<set devid="1"><item id="44" value="light pink"/></set>`,
    COLOR_PINK: `<set devid="1"><item id="44" value="pink"/></set>`,
  },

  createFakeServer(serverResponses = [], onData = (data = '') => data) {
    const client = (require('dgram')).createSocket('udp4');
    client.bind(30096);
    client.on('message', (__, remote) => {
      let message = _(`<server-announcement app='SAFFIRE-CONTROL' version='4' hostname='localhost' port='50000'/>`);
      client.send(message, 0, message.length, remote.port, remote.address);
    });

    return net.createServer((socket) => {
      socket.on('data', (chunk) => {
        onData(chunk.toString().replace(/\n/g,'').replace(/  /g,''))
        if (chunk.toString().includes('client-details')) {
          serverResponses.forEach((detail) => socket.write(_(detail)));
          socket.pipe(socket);
        }
      });
    }).listen(50000, '127.0.0.1');
  },

  findServerPort(callback = (port = 0) => port) {
    const client = (require('dgram')).createSocket('udp4');
    let foundPort = false;
    client.bind(61392);
    client.on('listening', () => {
      client.setBroadcast(true);
      client.setMulticastTTL(128);
      broadcast();
    });

    const broadcast = () => {
      if (foundPort) return;
      const message = _('<client-discovery app="SAFFIRE-CONTROL" version="4"/>');

      client.send(message, 0, message.length, 30096, '255.255.255.255');
      client.send(message, 0, message.length, 30097, '255.255.255.255');
      client.send(message, 0, message.length, 30098, '255.255.255.255');

      setTimeout(broadcast, 1000);
    };

    client.on('message', (message) => {
      foundPort = message.toString().match(/port\=\'([0-9]*)\'/)[1];
      callback(foundPort);
    });
  },

  createFakeClient(
    port = 0,
    clientKey = '',
    onConnected = (
      onData = (callback = (data = '') => data) => callback,
      clientWrite = (data = '') => data,
    ) => null,
  ) {
    const client = new net.Socket();
    client.connect(port, '127.0.0.1', () => {
      client.write(_(`<client-details client-key="${clientKey}"/>`));
      client.write(_(`<device-subscribe devid="1" subscribe="true"/>`));
      setInterval(() => client.write(_('<keep-alive/>')), 3000);
      onConnected(
        (onData) => client.on('data', (data) => onData(data.toString())),
        (data) => client.write(_(data)),
      );
    });
    client.on('error', (err) => console.error(err.message));
  },
};
