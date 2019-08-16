#!/usr/bin/env bash

#Example Usage:
[ $# -eq 0 ] && { echo -e "\nUsage `basename $0` <dataset> \n\nExample:\n`basename $0` mydataset\n"; exit 1; }

#Inputs
dataset=${1?param missing - Dataset Name}

if [ $# -gt 1 ]; then
	echo 1>&2 "$0: too many arguments"
	exit 1
fi


#echo "DGraph Server Node IPs:"
#kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="InternalIP")].address}'

echo "Dgraph Server URL:"

kubenode=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
kubenodeport=$(kubectl get services ${dataset}-dgraph-server-public -o jsonpath='{.spec.ports[?(@.name=="server-http")].nodePort}')


echo "${kubenode}:${kubenodeport}"

echo ""
