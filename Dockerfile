FROM       scottoasis/nginx-grunt-bower:latest
RUN        mkdir /app
WORKDIR    /app
ADD        package.json /app/
RUN        npm install
ADD        bower.json /app/
RUN        bower install --allow-root
ADD        . /app/
RUN        grunt snapshot
ADD        project/nginx.conf /etc/nginx/
ENTRYPOINT ["nginx"]

