# Delete AWS CFN Stack - wrapper for `aws cloudformation delete-stack`

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


# Delete Stack
#
aws cloudformation delete-stack \
	--stack-name ${stackName} \
	--profile ${stage}

if ! [ "$?" = "0" ]; then
	exitWithErrorMessage "Cannot delete stack ${stackName}!"
fi

#Wait for completion
waitForState ${stackName} "DELETE_COMPLETE"
