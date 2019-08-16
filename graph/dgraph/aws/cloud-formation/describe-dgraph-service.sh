#!/usr/bin/env bash

#Example Usage:
[ $# -eq 0 ] && { echo -e "\nUsage `basename $0` <dataset> \n\nExample:\n`basename $0` mydataset\n"; exit 1; }

#Inputs
dataset=${1?param missing - Dataset Name}

if [ $# -gt 1 ]; then
	echo 1>&2 "$0: too many arguments"
	exit 1
fi


echo "Dgraph Services for ${dataset}"
kubectl describe services -l dataset=${dataset}

echo ""
