FROM nginx:stable

ADD ssl/server.crt /etc/nginx/server.crt
ADD ssl/server.key /etc/nginx/server.key

RUN chmod 640 /etc/nginx/server.*

ADD network /var/www/html

ADD nginx.conf /etc/nginx/nginx.conf

EXPOSE 443


#CMD ["nginx", "-g", "daemon off;"]

# CMD ["nginx", "-c", "/etc/nginx/nginx.conf", "-t"]
