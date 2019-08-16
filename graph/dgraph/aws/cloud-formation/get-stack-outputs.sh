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


#Functions
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


#Get Stack Info
aws cloudformation describe-stacks \
	--stack-name ${stackName} \
	--output text \
	--query 'Stacks[0].Outputs' \
	--profile ${stage}

if ! [ "$?" = "0" ]; then
	exitWithErrorMessage "Cannot get stack ${configName}-${stage}!"
fi
