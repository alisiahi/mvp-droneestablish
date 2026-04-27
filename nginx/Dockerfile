FROM nginx:alpine

# Install certbot and openssl for SSL automation
RUN apk add --no-cache certbot certbot-nginx openssl bash

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
