FROM nginx:alpine

WORKDIR /app/static

COPY css ./css
COPY img ./img
COPY js ./js
COPY index.html .
COPY admin.html .

COPY ./docker/nginx.conf /etc/nginx/nginx.conf
