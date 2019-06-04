# LifeLongLearning

This project still in progress.

## Aim

The main goal of this project it's display relations between entities.

### Roadmap

* [ ] Improve the codebase of crawler tool

* [ ] Create a tool for ease transferring between neo4j data  and frontend part

* [ ] Create an MVP recommendation system based on existing knowledge graph

### Test Drive

https://208.97.141.92/

### Getting started

- There are three main part of project:
```
  |-- storage-graph
  .
  |-- web-client
  .
  |-- wikipedia-crawler
```

1. `storage-graph` - the storage that we use for storing our entity relations. Under the hood we use  [neo4j](https://neo4j.com/)
2. `web-client` - visual display of a knowledge graph
3. `wikipedia-crawler` - tool for crawling new data within wikipedia

### Run all in

```
docker-compose up

```
