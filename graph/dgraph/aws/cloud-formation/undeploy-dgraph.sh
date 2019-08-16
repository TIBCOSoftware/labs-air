#!/usr/bin/env bash

#Example Usage:
[ $# -eq 0 ] && { echo -e "\nUsage `basename $0` <dataset> \n\nExample:\n`basename $0` mydataset\n"; exit 1; }

#Inputs
dataset=${1?param missing - Dataset Name}

if [ $# -gt 1 ]; then
	echo 1>&2 "$0: too many arguments"
	exit 1
fi


# Create AWS Dgraph Cluster
echo "Undeploying Dgrah Cluster for ${dataset}"

echo "DGraph Cluster will be undeployed from the following nodes"
kubectl get pods -o wide -l dataset=${dataset}

# Remove pods
kubectl delete pods,statefulsets,services,persistentvolumeclaims,persistentvolume -l app=${dataset}-dgraph-zero
kubectl delete pods,statefulsets,services,persistentvolumeclaims,persistentvolume -l app=${dataset}-dgraph-server

sleep 60

echo "DGraph Cluster for ${dataset} after delete"
kubectl get pods -o wide -l dataset=${dataset}


echo "DGraph Cluster after delete"
kubectl get pods -o wide
