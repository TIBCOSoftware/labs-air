#!/bin/bash

function build_and_push(){
    image_name=$1
    image_tag=$2
    image_url=$3
    echo "Building image  ${image_name}..."
    docker build -t ${image_name} .
    echo "Tagging image ${image_url}/${image_name}:${image_tag}..."
    docker tag ${image_name} ${image_url}/${image_name}:${image_tag}
    echo "Pushing image ${image_url}/${image_name}:${image_tag}..."
    docker push ${image_url}/${image_name}:${image_tag}
    echo "Pushing image finished ..."
    docker rmi ${image_url}/${image_name}:${image_tag}
    docker rmi ${image_name}
}