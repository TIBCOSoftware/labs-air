#!/usr/bin/env bash

#Example Usage:
[ $# -eq 0 ] && { echo -e "\nUsage `basename $0` <S3 Bucket> <Stage>\n\nExample:\n`basename $0` my-bucket local\n"; exit 1; }

#Inputs
s3Bucket=${1?param missing - S3 Bucket Name}
stage=${2?param missing - Environment Name}

if [ $# -gt 2 ]; then
	echo 1>&2 "$0: too many arguments"
	exit 1
fi



echo "Uploading templates"

aws s3 cp $(pwd)/CFTemplates/dynamodb.yml s3://$1/ --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --storage-class REDUCED_REDUNDANCY --profile ${stage}
aws s3 cp $(pwd)/CFTemplates/kubernetes-cluster.yml s3://$1/ --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --storage-class REDUCED_REDUNDANCY --profile ${stage}
aws s3 cp $(pwd)/CFTemplates/convui-infra.yml s3://$1/ --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --storage-class REDUCED_REDUNDANCY --profile ${stage}
aws s3 cp $(pwd)/CFTemplates/vpc-endpoint-dynamodb.yml s3://$1/ --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --storage-class REDUCED_REDUNDANCY --profile ${stage}
aws s3 cp $(pwd)/CFTemplates/vpc-kube-containers.yml s3://$1/ --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --storage-class REDUCED_REDUNDANCY --profile ${stage}
echo ""
echo "Templates uploaded to S3"
