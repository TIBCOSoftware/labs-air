#!/usr/bin/env bash

#Example Usage:
[ $# -eq 0 ] && { echo -e "\nUsage `basename $0` <dataset> \n\nExample:\n`basename $0` mydataset\n"; exit 1; }

#Inputs
dataset=${1?param missing - Dataset Name}

if [ $# -gt 1 ]; then
	echo 1>&2 "$0: too many arguments"
	exit 1
fi


# Delete Dgraph Volume
echo "Deleting Dgraph Volume for ${dataset}"

echo "Persistent Volume Claims before delete"
kubectl get persistentVolumeClaims -l dataset=${dataset}


# Delete Persistent Volumes
echo "Delete Persistent Volumes and Persistent Volume Claims"
kubectl delete -f ./KubeTemplates/${dataset}-dgraph-pvc.yaml

sleep 15

echo "Persistent Volume Claims after delete"
kubectl get persistentVolumeClaims -l dataset=${dataset}

sleep 5

echo "DGraph Cluster after delete"
kubectl get pods -o wide
