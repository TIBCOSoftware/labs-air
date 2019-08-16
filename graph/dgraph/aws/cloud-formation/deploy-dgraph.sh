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


# Create AWS Dgraph Cluster
echo "Creating Dgrah Cluster for ${dataset}"

echo "DGraph Cluster will be deployed to the following nodes"
kubectl get nodes -l dataset=${dataset}


echo "Create DGraph Zero Pods"
kubectl create -f ./KubeTemplates/${dataset}-dgraph-zero.yaml

echo "Wait for Pods to be ready"
waitUntilPodsReady 240 5

echo "Create DGraph Server Pods"
kubectl create -f ./KubeTemplates/${dataset}-dgraph-server.yaml

echo "Wait for Pods to be ready"
waitUntilPodsReady 240 5

echo "Dgraph pods"
kubectl get pods -o wide -l dataset=${dataset}
echo ""

echo "Dgraph Services"
kubectl describe services -l dataset=${dataset}
echo ""

echo "Dgraph Server URL"

kubenode=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
kubenodeport=$(kubectl get services ${dataset}-dgraph-server-public -o jsonpath='{.spec.ports[?(@.name=="server-http")].nodePort}')

echo "${kubenode}:${kubenodeport}"
echo ""
