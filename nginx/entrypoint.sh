#!/bin/bash

# Default to localhost if not provided
DOMAIN=${PUBLIC_DOMAIN:-localhost}
SSL_DIR="/etc/nginx/ssl"
LE_LIVE_DIR="/etc/letsencrypt/live/$DOMAIN"

mkdir -p $SSL_DIR
mkdir -p /var/www/certbot

echo "Starting Nginx entrypoint for domain: $DOMAIN"

# 1. Create dummy cert if we don't have ANY certificate in Nginx's path
if [ ! -f $SSL_DIR/fullchain.pem ]; then
    echo "No certificate found in $SSL_DIR. Checking for existing Let's Encrypt certificates..."
    
    if [ -f $LE_LIVE_DIR/fullchain.pem ]; then
        echo "Found existing Let's Encrypt certificates! Copying to Nginx..."
        cp $LE_LIVE_DIR/fullchain.pem $SSL_DIR/fullchain.pem
        cp $LE_LIVE_DIR/privkey.pem $SSL_DIR/privkey.pem
    else
        echo "No Let's Encrypt certificates found. Generating temporary self-signed certificate to allow Nginx to start..."
        openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
            -keyout $SSL_DIR/privkey.pem \
            -out $SSL_DIR/fullchain.pem \
            -subj "/CN=localhost"
    fi
fi

# 2. Start Nginx in background
echo "Starting Nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Give Nginx a few seconds to boot up (needed to serve the .well-known acme challenge)
sleep 3

# 3. If domain is not localhost, try to acquire/renew Let's Encrypt certificate
if [ "$DOMAIN" != "localhost" ]; then
    echo "Attempting to fetch Let's Encrypt certificates for $DOMAIN..."
    # The || true prevents the script from crashing if it fails (e.g. port 80 not open yet)
    certbot certonly --webroot -w /var/www/certbot -d $DOMAIN --email admin@egov.uni-koblenz.de --rsa-key-size 4096 --agree-tos --non-interactive || true

    # If certbot succeeded (either just now or previously), apply the certificates
    if [ -f $LE_LIVE_DIR/fullchain.pem ]; then
        echo "Valid Let's Encrypt certificates found! Applying..."
        cp $LE_LIVE_DIR/fullchain.pem $SSL_DIR/fullchain.pem
        cp $LE_LIVE_DIR/privkey.pem $SSL_DIR/privkey.pem
        # Reload Nginx so it uses the new certificates instead of the dummy ones
        nginx -s reload
    else
        echo "Failed to get Let's Encrypt certificates. Nginx will continue using the temporary/self-signed certs."
        echo "This is expected if port 80 is not yet accessible from the internet."
    fi

    # 4. Run certbot renewal in background
    # It attempts to renew every 12 hours. If successful, it copies and reloads Nginx.
    (
        while :; do 
            sleep 12h
            echo "Running scheduled certbot renewal..."
            certbot renew --quiet
            if [ -f $LE_LIVE_DIR/fullchain.pem ]; then
                cp $LE_LIVE_DIR/fullchain.pem $SSL_DIR/fullchain.pem
                cp $LE_LIVE_DIR/privkey.pem $SSL_DIR/privkey.pem
                nginx -s reload
            fi
        done
    ) &
else
    echo "Running locally (domain is localhost). Skipping Let's Encrypt."
fi

# Wait for Nginx process
wait $NGINX_PID
