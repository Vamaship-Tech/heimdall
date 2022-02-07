const amqplib = require("amqplib");

function createRabbitMqConnection() {
  const user = process.env.RABBITMQ_USER || "guest";
  const password = encodeURIComponent(process.env.RABBITMQ_PASSWORD || "guest");
  const host = process.env.RABBITMQ_HOST || "localhost";
  var amqp_url = `amqp://${user}:${password}@${host}:5672`;
  return amqplib.connect(amqp_url, "heartbeat=60");
}
/**
 * 
 * @param {String} message 
 * @param {import("amqplib").Channel} channel 
 * @param {string} queue 
 */
async function produce(message, channel, queue) {
  var exch = "mongo_syncer";
  var rkey = "";

  await channel
    .assertExchange(exch, "direct", { durable: true })
    .catch(console.error);
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exch, rkey);
  console.log({
    message
  });
  channel.publish(exch, rkey, Buffer.from(message));
}

module.exports = {
  createRabbitMqConnection,
  produce,
};
