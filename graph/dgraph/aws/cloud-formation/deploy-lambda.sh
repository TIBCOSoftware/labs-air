# Create AWS CFN Stack - wrapper for `aws cloudformation create-stack`

#Example Usage:
[ $# -eq 0 ] && { echo -e "\nUsage `basename $0` <stack name> <Stage> <S3 Bucket Name> \n\nExample:\n`basename $0` myconfigname local S3bucket\n"; exit 1; }

#Inputs
configName=${1?param missing - Config Name}
stage=${2?param missing - Json Tags file}
s3Bucket=${3?param missing - S3 Bucket}

if [ $# -gt 3 ]; then
	echo 1>&2 "$0: too many arguments"
	exit 1
fi

stackName=${configName}-${stage}
templateFile=./CFTemplates/${configName}.yml
paramsFile=${configName}-params-${stage}.properties

packagedFile=${1}.yml.packaged

#Functions
#-------------------------------------------------------------------------------
# Retrieve the status of a cfn stack
#
# Args:
# $1  The name of the stack
#-------------------------------------------------------------------------------
getStackStatus() {
	aws cloudformation describe-stacks \
		--stack-name $1 \
		--query Stacks[].StackStatus \
		--output text
}

#-------------------------------------------------------------------------------
# Waits for a stack to reach a given status. If the stack ever reports any
# status other thatn *_IN_PROGRESS we will return failure status, as all other
# statuses that are not the one we are waiting for are considered terminal
#
# Args:
# $1  Stack name
# $2  The stack status to wait for
#-------------------------------------------------------------------------------
waitForState() {
	local status

	status=$(getStackStatus $1)

	while [[ "$status" != "$2" ]]; do
		echo "Waiting for stack $1 to obtain status $2 - Current status: $status"

		# If the status is not one of the "_IN_PROGRESS" status' then consider
		# this an error
		if [[ "$status" != *"_IN_PROGRESS"* ]]; then
			exitWithErrorMessage "Unexpected status '$status'"
		fi

		status=$(getStackStatus $1)

		sleep 5
	done
	echo "Stack $1 obtained $2 status"
}

#-------------------------------------------------------------------------------
# Exit the program with error status 1.
#
# Args:
# $1  Error message to display when exiting
#-------------------------------------------------------------------------------
exitWithErrorMessage() {
	echo "ERROR: $1"
	exit 1
}

# Package Template
# Package the local artifacts (local paths) that the AWS
# CloudFormation SAM (Serverless Application Model) templates reference.
# The  command  uploads  local  artifacts,  such  as source code for an
# AWS Lambda function or a Swagger file for an AWS API Gateway REST API,
# to an S3 bucket.
# The command returns a copy  of  your template,  replacing references to
# local artifacts with the S3 location where the command uploaded the artifacts
aws cloudformation package \
  --template-file ${templateFile} \
	--output-template-file ${packagedFile} \
	--s3-bucket ${s3Bucket} \
	--profile ${stage}

if ! [ "$?" = "0" ]; then
	exitWithErrorMessage "Cannot package sam stack ${stackName}!"
fi

# Deploy Stack
# Deploy the graphbot serverless AWS CloudFormation template by creating and
# then executing a change set
aws cloudformation deploy \
	--capabilities CAPABILITY_IAM \
	--stack-name ${stackName} \
	--template-file ${packagedFile} \
	--parameter-overrides $(cat ${paramsFile}) \
	--profile ${stage}

if ! [ "$?" = "0" ]; then
	exitWithErrorMessage "Cannot deploy stack ${stackName}!"
fi

#Wait for completion
waitForState ${stackName} "CREATE_COMPLETE"

#Remove packaged file
rm ${packagedFile}
