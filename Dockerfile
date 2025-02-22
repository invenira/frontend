FROM node:22.12.0-slim@sha256:a4b757cd491c7f0b57f57951f35f4e85b7e1ad54dbffca4cf9af0725e1650cd8 AS builder
COPY . .
RUN npm ci
RUN npm run build
FROM nginx:alpine3.21-perl@sha256:b948629705bb94a3947846babda0a222577b1eadcc3e551bfafef47c7581666b AS runner
RUN rm /etc/nginx/conf.d/default.conf
COPY /nginx/nginx.conf /etc/nginx/conf.d
COPY --from=builder /dist/ /usr/share/nginx/html