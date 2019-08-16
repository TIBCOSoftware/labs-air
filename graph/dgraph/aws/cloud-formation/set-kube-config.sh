#!/usr/bin/env bash

#Example Usage:
[ $# -eq 0 ] && { echo -e "\nUsage `basename $0` <config name> <stage>\n\nExample:\n`basename $0` myconfigname stage\n"; exit 1; }

#Inputs
configName=${1?param missing - Stack Name}
stage=${2?param missing - Environment Name}

if [ $# -gt 2 ]; then
	echo 1>&2 "$0: too many arguments"
	exit 1
fi

stackName=${configName}-${stage}


getStackKubeCommands() {
	aws cloudformation describe-stacks \
	  --stack-name ${stackName} \
		--query Stacks[0].Outputs[0].OutputValue \
		--profile ${stage}
}

cleanCommand() {

	firstString=$1
	secondString="NNNN"
	temp="${firstString//\\\\/$secondString}"
	thirdString="\""
	temp1="${temp//\\\"/$thirdString}"
	fourthString="\\"
	temp2="${temp1//NNNN/$fourthString}"

# Remove first and last quotes
	temp3="${temp2%\"}"
	temp3="${temp3#\"}"
	echo "$temp3"
}

echo "Getting commands to setup Kubernetes Environment to access ${stackName} environment"

kubecmd=$(getStackKubeCommands ${stackName})
kubecmdclean=$(cleanCommand "$kubecmd")

echo "Run the following commands:"
echo $kubecmdclean
eval $kubecmdclean
