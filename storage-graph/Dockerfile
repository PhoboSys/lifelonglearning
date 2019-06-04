FROM neo4j:3.5

RUN echo "dbms.security.procedures.unrestricted=algo.*,apoc.*" >> /var/lib/neo4j/conf/neo4j.conf

RUN apk update && apk add wget \
    curl && rm -rf /var/lib/apt/lists/*


ADD graph-algorithms-algo-3.5.4.0.jar /var/lib/neo4j/plugins/

EXPOSE 7474 7473 7687
