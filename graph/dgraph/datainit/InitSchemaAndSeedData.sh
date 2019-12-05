#!/bin/bash

dgraph live -r ~/iot/dgraph/seed_data/iot_seed_data.rdf -s ~/iot/dgraph/schema/iot_schema.rdf -d localhost:9080 -z localhost:5080
