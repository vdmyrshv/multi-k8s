FROM nginx

# technically nginx already creates a default.conf file, but what we're doing here
# is telling nginx to overwrite the installed file with our own
COPY ./default.conf /etc/nginx/conf.d/default.conf