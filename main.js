const mysql = require("mysql");
const MySQLEvents = require("@rodrigogs/mysql-events");
const ora = require("ora");
const migrator = require("./utils/migrator");
const chalk = require("chalk");
const spinner = ora({
  text: chalk.green("In the brightest day, and the blackest night, No evil shall escape Heimdall's sight"),
  color: "green",
  spinner: "dots2",
});

const program = async () => {
  const connection = mysql.createConnection({
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  const instance = new MySQLEvents(connection, {
    startAtEnd: true,
  });

  await instance.start();
  const amqpConnection = await migrator.createRabbitMqConnection();
  const tables = [
    "shipments",
    "shipment_inputs",
    "transactions",
    "shipment_tracking_details",
    "cod_transactions",
    "shipment_addresses",
    "shipment_line_items",
    "shipment_packages",
    "shipment_weight_histories",
    "shipment_supplier_responses",
    "shipment_cost_breakups",
    "shipment_sku_images",
    "shipment_milestone_dates",
  ];
  const channel = await amqpConnection.createChannel();
  const eventHandler = async (e) => {
    try {
      let rows = e.affectedRows;
      rows =
        e.type == "DELETE"
          ? rows.map((row) => row.before)
          : rows.map((row) => row.after);

      const obj = {
        type: e.type,
        schema: e.schema,
        table: e.table,
        rows,
      };
      await migrator.produce(JSON.stringify(obj), channel, obj.table);
      spinner.succeed("👽 _EVENT_ 👽");
      spinner.start();
    } catch (error) {
      console.log(chalk.red(error));
    }
  };

  tables.forEach(table => {
    instance.addTrigger({
      name: "monitoring all statments",
      expression: `ecom3.${table}`,
      statement: MySQLEvents.STATEMENTS.ALL,
      onEvent: eventHandler,
    });
  })

  instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, (e) =>
    console.log(chalk.red(e))
  );
  instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, (e) =>
    console.log(chalk.red(e))
  );
};

program()
  .then(spinner.start.bind(spinner))
  .catch((e) => console.log(chalk.red(e)));
