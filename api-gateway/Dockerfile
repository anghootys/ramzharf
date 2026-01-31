FROM nginx:alpine

RUN sed -i 's|https://dl-cdn.alpinelinux.org|https://mirror.arvancloud.ir|g' /etc/apk/repositories

RUN apk add --no-cache openssl

COPY nginx/ssl/generate-self-signed-certs.sh /docker-entrypoint.d/00-generate-self-signed-certs.sh
RUN chmod +x /docker-entrypoint.d/00-generate-self-signed-certs.sh

# Remove default NGINX config to avoid conflicts
RUN rm -f /etc/nginx/conf.d/default.conf

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/conf.d /etc/nginx/conf.d

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]