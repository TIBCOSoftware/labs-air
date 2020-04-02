#!/bin/sh

# Copyright 2017 Konrad Zapalowicz <bergo.torino@gmail.com>
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

# Start EdgeX Foundry services in right order, as described:
# https://wiki.edgexfoundry.org/display/FA/Get+EdgeX+Foundry+-+Users

COMPOSE_FILE=${1:-docker-compose.yml}
echo "Using compose file: $COMPOSE_FILE"

run_service () {
    echo "\n"
    echo -e "\033[0;32mStarting.. $1\033[0m"
    docker-compose -f "$COMPOSE_FILE" up -d $1
	
    if [ "$1" = "config-seed" ]
    then
         while [ -z "$(curl -s http://localhost:8500/v1/kv/config/device-virtual\;docker/app.open.msg)" ]
         do
               sleep 1
         done
         echo "$1 has been completely started !"
         return
    fi

    if [ -z "$2" ]
    then
         sleep 10
         echo "$1 has been completely started !"
         return
    fi
    
    if [ -n "$2" ]
    then
        sleep 10
        echo "$1 has been completely started !"
        return
    fi
}

run_service volume

run_service consul

run_service config-seed

run_service vault 8200

run_service vault-worker

run_service kong-db

run_service kong-migrations

run_service kong

run_service edgex-proxy

run_service mongo

run_service logging 48061

run_service system 48090

run_service notifications 48060

run_service metadata 48081

run_service data 48080

run_service command 48082

run_service scheduler 48085

# run_service export-client 48071

# run_service export-distro 48070

##run_service service-flogo-rules 48095

run_service service-export-mqtt 48500

# run_service service-export-kafka 48505

# run_service device-mqtt 49982

##run_service device-particle-mqtt 48988

# run_service device-enersys-mqtt 49985

# run_service device-jabil-rest 49995

run_service device-vehicle-simulator 48992

run_service device-siemens-simulator 48995

# run_service device-siemens-rest 48998

# run_service device-virtual 49990

# run_service device-random 49988

run_service portainer 9000

echo "\n"
echo -e "\033[0;32m All services started. Edgex is ready\033[0m"

