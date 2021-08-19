const amqplib = require("amqplib");

function createRabbitMqConnection() {
    const user = process.env.RABBITMQ_USER || 'guest';
    const password = encodeURIComponent(process.env.RABBITMQ_PASSWORD || 'guest');
    const host = process.env.RABBITMQ_HOST || 'localhost';
    var amqp_url = `amqp://${host}:5672`;
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