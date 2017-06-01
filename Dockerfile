FROM       node:5.2.0
RUN        mkdir -p /app
WORKDIR    /app
ADD        .npmrc /app/
ADD        package.json /app/
RUN        npm install --no-optional
ADD        . /app/
ENV        GIAN_GATEWAY=dev
RUN        node_modules/.bin/webpack -p
RUN        cd /app/dist
RUN        npm install
ENTRYPOINT ["node"]
CMD        ["/app/dist/server.js"]
