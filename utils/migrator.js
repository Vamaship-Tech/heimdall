const amqplib = require("amqplib");

function createRabbitMqConnection() {
    var amqp_url = "amqp://localhost:5672";
    return  amqplib.connect(amqp_url, "heartbeat=60");
}

async function produce(message, channel) {
  var exch = "mongo_syncer";
  var q = "shipments";
  var rkey = "";

  await channel
    .assertExchange(exch, "direct", { durable: true })
    .catch(console.error);
  await channel.assertQueue(q, { durable: true });
  await channel.bindQueue(q, exch, rkey);
  channel.publish(exch, rkey, Buffer.from(message));
}

module.exports = {
  createRabbitMqConnection, produce,
};