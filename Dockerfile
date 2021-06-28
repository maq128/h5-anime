FROM caddy:2.3.0-alpine

COPY ./dist/dist /app
WORKDIR /app
EXPOSE 80
CMD ["caddy", "file-server"]
