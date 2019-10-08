#!/bin/bash

. scripts/tools.sh

image_name=$1
image_tag=$2
image_url=$3

cd ui/IoTCloudStarter
build_and_push $image_name $image_tag $image_url