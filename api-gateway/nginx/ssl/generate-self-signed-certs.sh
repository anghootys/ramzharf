#!/bin/sh

SSL_DIR="/etc/nginx/ssl"
mkdir -p ${SSL_DIR}

if [ ! -f "${SSL_DIR}/server.key" ] || [ ! -f "${SSL_DIR}/server.crt" ]; then
    echo "Generating self-signed SSL certificates..."

    openssl req -x509 -nodes -days 365 \
        -newkey rsa:2048 \
        -keyout "${SSL_DIR}/server.key" \
        -out "${SSL_DIR}/server.crt" \
        -subj "/C=IR/ST=Sajjad/L=Anghooty/O=Dis/CN=www.ramzharf.ir"

    echo "Self-signed SSL certificates generated at ${SSL_DIR}/server.key and ${SSL_DIR}/server.crt"
else
    echo "SSL certificates already exist. Skipping generation."
fi