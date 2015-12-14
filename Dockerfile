FROM       node:5.2.0
RUN        mkdir /app
WORKDIR    /app
ADD        package.json /app/
RUN        npm install
ADD        . /app/
RUN        make build
ENTRYPOINT ["node", "/app/server.js"]

