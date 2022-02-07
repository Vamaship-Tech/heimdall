#!/bin/sh

while ! nc -z rabbitmq 5672; do
    echo "Waiting for rabbitmq connection.."
    sleep 3
done

npm run docker >> output.log 2>&1