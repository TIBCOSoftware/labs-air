# Create AWS CFN Stack - wrapper for `aws cloudformation create-stack`

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
templateFile=CFTemplates/${configName}.yml
paramsFile=${configName}-params-${stage}.json
tagsFile=${configName}-tags-${stage}.json

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
		--output text \
		--profile ${stage}
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

		sleep 30
	done
	echo "Stack $1 obtained $2 status"
}

#-------------------------------------------------------------------------------
# Returns content of JSON file containing params or tags
# Strips out all spaces, newlines etc. for input to aws cli command
# Spaces you want in Values should be encoded. e.g.
#   {"Key":"Project","Value":"My\u0020Text"}
#
# Args:
# $1  Path to json file of parameters
#-------------------------------------------------------------------------------
getJsonFileContents() {
	json=$(awk -v ORS= -v OFS= '{$1=$1}1' ${1})
	echo "$json"
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

#-------------------------------------------------------------------------------
# Returns a file URL for the given path
#
# Args:
# $1  Path
#-------------------------------------------------------------------------------
getFileUrl() {
	if [[ "$(uname -s)" == "Linux"* ]]; then
		# The real thing
		echo "file://${1}"
	elif [[ "$(uname -s)" == "MINGW"* ]]; then
		# Git Bash Hack
		echo "file://${1:1:1}:${1:2}"
	else
		# Mac OS X Hack
		echo "file://$(pwd)/${1}"
	fi
}

#Create Stack
aws cloudformation create-stack \
	--capabilities CAPABILITY_IAM \
	--parameters $(getJsonFileContents ${paramsFile}) \
	--tags $(getJsonFileContents ${tagsFile}) \
	--stack-name ${stackName} \
	--template-body $(getFileUrl ${templateFile}) \
	--profile ${stage}

if ! [ "$?" = "0" ]; then
	exitWithErrorMessage "Cannot create stack ${configName}-${stage}!"
fi

#Wait for completion
waitForState ${configName}-${stage} "CREATE_COMPLETE"
