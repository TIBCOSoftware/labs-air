package rules

import (
	"fmt"
	"io/ioutil"

	"github.com/edgexfoundry/go-mod-core-contracts/clients/logger"
	"github.com/project-flogo/rules/common/model"
	"github.com/project-flogo/rules/ruleapi"
)

// LoggingClient - global variable containing Logging Client
var LoggingClient logger.LoggingClient

// CreateRuleSession - creates a rule session
func CreateRuleSession(tupleTypesFilename string) (model.RuleSession, error) {
	rs, _ := ruleapi.GetOrCreateRuleSession("FlogoRulesSession")

	tupleDescFilePath := "./res/" + tupleTypesFilename

	tup, err := ioutil.ReadFile(tupleDescFilePath)
	if err != nil {

		LoggingClient.Error(fmt.Sprintf("exit msg: %s", err))

		return nil, err
	}

	err = model.RegisterTupleDescriptors(string(tup))
	if err != nil {
		return nil, err
	}

	LoggingClient.Info(fmt.Sprintf("Read tuple descriptor: %s", tup))
	return rs, nil
}

// CreateAndLoadRuleSession - creates a rule session and loads rules from config file
func CreateAndLoadRuleSession(tupleTypesFilename string, ruleDefsFilename string) (model.RuleSession, error) {
	LoggingClient.Info(fmt.Sprintf("Creating Rule Session and Rules \n"))

	loadTupleSchema(tupleTypesFilename)

	RegisterConditionsAndActions()

	rs, _ := createRuleSession(ruleDefsFilename)

	return rs, nil
}

func loadTupleSchema(tupleTypesFilename string) error {

	tupleDescFilePath := "./res/" + tupleTypesFilename
	tup, err := ioutil.ReadFile(tupleDescFilePath)
	if err != nil {
		LoggingClient.Error(fmt.Sprintf("exit msg: %s", err))
		return err
	}

	err = model.RegisterTupleDescriptors(string(tup))
	if err != nil {
		return err
	}

	return nil
}

func createRuleSession(ruleDefsFilename string) (model.RuleSession, error) {
	ruleDefsFilePath := "./res/" + ruleDefsFilename

	rulesDefs, err := ioutil.ReadFile(ruleDefsFilePath)
	if err != nil {
		LoggingClient.Error(fmt.Sprintf("exit msg: %s", err))
		return nil, err
	}

	return ruleapi.GetOrCreateRuleSessionFromConfig("FlogoRulesSession", string(rulesDefs))
}
