FROM node:20-alpine

ENV PGHOST=db
ENV PGDATABASE=apicarto
ENV PGUSER=postgres
ENV PGPASSWORD=postgis
ENV PGPORT=5432

COPY --chown=node:node . /opt/apicarto

WORKDIR /opt/apicarto
USER node
RUN npm install

EXPOSE 8091
CMD ["node", "server.js"]

