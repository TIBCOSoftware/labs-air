#!/usr/bin/env bash

#Example Usage:
[ $# -eq 0 ] && { echo -e "\nUsage `basename $0` <dataset> \n\nExample:\n`basename $0` mydataset\n"; exit 1; }

#Inputs
dataset=${1?param missing - Dataset Name}

if [ $# -gt 1 ]; then
	echo 1>&2 "$0: too many arguments"
	exit 1
fi


function isPodReady() {
  [[ "$(kubectl get po "$1" -o 'jsonpath={.status.conditions[?(@.type=="Ready")].status}')" == 'True' ]]
}

function podsReady() {
  local pod

  [[ "$#" == 0 ]] && return 0

  for pod in $pods; do
    isPodReady "$pod" || return 1
  done

  return 0
}

function waitUntilPodsReady() {
  local period interval i pods

  if [[ $# != 2 ]]; then
    echo "Usage: wait-until-pods-ready PERIOD INTERVAL" >&2
    echo "" >&2
    echo "This script waits for all pods to be ready in the current namespace." >&2

    return 1
  fi

  period="$1"
  interval="$2"

  for ((i=0; i<$period; i+=$interval)); do
    pods="$(kubectl get po -o 'jsonpath={.items[*].metadata.name}')"
    if podsReady $pods; then
      return 0
    fi

    echo "Waiting for pods to be ready..."
    sleep "$interval"
  done

  echo "Waited for $period seconds, but all pods are not ready yet."
  return 1
}


# Create Volume and load data
echo "Loading Dgrah Data for ${dataset}"

echo "DGraph Cluster will be deployed to the following nodes"
kubectl get nodes -l dataset=${dataset}

# Create Persistent Volumes
echo "Create Persistent Volumes and Persistent Volume Claims"
kubectl create -f ./KubeTemplates/${dataset}-dgraph-pvc.yaml

sleep 15

echo "Persistent Volume Claims"
kubectl get persistentVolumeClaims -l dataset=${dataset}

echo "Creating temporary pods to upload seed data to persistent volumes"
kubectl create -f ./KubeTemplates/${dataset}-dgraph-dataloader-pod.yaml

echo "Wait for Pods to be ready"
waitUntilPodsReady 240 15

echo "Temporary Pods for data loading"
kubectl get pods -o wide -l dataset=${dataset}

echo "Copy seed data to persistent volumes"
kubectl cp ./LocalConvUIData/${dataset}/p ${dataset}-dgraph-load-data-0:/dgraph
echo "Copy to ${dataset}-dgraph-load-data-0:/dgraph completed"
#kubectl cp ./LocalConvUIData/${dataset}/p ${dataset}-dgraph-load-data-1:/dgraph
#echo "Copy to ${dataset}-dgraph-load-data-1:/dgraph completed"
#kubectl cp ./LocalConvUIData/${dataset}/p ${dataset}-dgraph-load-data-2:/dgraph
#echo "Copy to ${dataset}-dgraph-load-data-2:/dgraph completed"

sleep 5

echo "Delete temporary pods"
kubectl delete pods -l app=${dataset}-dgraph-loader

sleep 60

echo ""
echo "Current pods for ${dataset}"
kubectl get pods -o wide -l dataset=${dataset}
