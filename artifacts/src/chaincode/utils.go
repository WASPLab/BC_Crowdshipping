package main

import (
	"encoding/base64"
	"fmt"

	"github.com/hyperledger/fabric-chaincode-go/pkg/statebased"
	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func (s *SmartContract) GetSubmittingClientIdentity(ctx contractapi.TransactionContextInterface) (string, error) {

	b64ID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return "", fmt.Errorf("Failed to read clientID: %v", err)
	}
	decodeID, err := base64.StdEncoding.DecodeString(b64ID)
	if err != nil {
		return "", fmt.Errorf("failed to base64 decode clientID: %v", err)
	}
	return string(decodeID), nil
}

// setOrderStateBasedEndorsement sets the endorsement policy of a new order
func setOrderStateBasedEndorsement(ctx contractapi.TransactionContextInterface, orderID string, orgToEndorse string) error {

	endorsementPolicy, err := statebased.NewStateEP(nil)
	if err != nil {
		return err
	}
	err = endorsementPolicy.AddOrgs(statebased.RoleTypePeer, orgToEndorse)
	if err != nil {
		return fmt.Errorf("failed to add org to endorsement policy: %v", err)
	}
	policy, err := endorsementPolicy.Policy()
	if err != nil {
		return fmt.Errorf("failed to create endorsement policy bytes from org: %v", err)
	}
	err = ctx.GetStub().SetStateValidationParameter(orderID, policy)
	if err != nil {
		return fmt.Errorf("failed to set validation parameter on order: %v", err)
	}

	return nil
}

// addOrderStateBasedEndorsement adds a new organization as an endorser of the order
func addOrderStateBasedEndorsement(ctx contractapi.TransactionContextInterface, orderID string, orgToEndorse string) error {

	endorsementPolicy, err := ctx.GetStub().GetStateValidationParameter(orderID)
	if err != nil {
		return err
	}

	newEndorsementPolicy, err := statebased.NewStateEP(endorsementPolicy)
	if err != nil {
		return err
	}

	err = newEndorsementPolicy.AddOrgs(statebased.RoleTypePeer, orgToEndorse)
	if err != nil {
		return fmt.Errorf("failed to add org to endorsement policy: %v", err)
	}
	policy, err := newEndorsementPolicy.Policy()
	if err != nil {
		return fmt.Errorf("failed to create endorsement policy bytes from org: %v", err)
	}
	err = ctx.GetStub().SetStateValidationParameter(orderID, policy)
	if err != nil {
		return fmt.Errorf("failed to set validation parameter on auction: %v", err)
	}

	return nil
}

// verifyClientOrgMatchesPeerOrg checks that the client is from the same org as the peer
func verifyClientOrgMatchesPeerOrg(clientOrgID string) error {
	peerOrgID, err := shim.GetMSPID()
	if err != nil {
		return fmt.Errorf("failed getting peer's orgID: %v", err)
	}

	if clientOrgID != peerOrgID {
		return fmt.Errorf("client from org %s is not authorized to read or write private data from an org %s peer",
			clientOrgID,
			peerOrgID,
		)
	}
	return nil
}

// getClientImplicitCollectionNameAndVerifyClientOrg gets the implicit collection for the client and checks that the client is from the same org as the peer
func getClientImplicitCollectionNameAndVerifyClientOrg(ctx contractapi.TransactionContextInterface) (string, error) {
	clientOrgID, err := getClientOrgID(ctx)
	if err != nil {
		return "", err
	}

	// err = verifyClientOrgMatchesPeerOrg(clientOrgID)
	// if err != nil {
	// 	return "", err
	// }

	return buildCollectionName(clientOrgID), nil
}

// buildCollectionName returns the implicit collection name for an org
func buildCollectionName(clientOrgID string) string {
	return fmt.Sprintf("_implicit_org_%s", clientOrgID)
}

func contains(sli []string, str string) bool {
	for _, a := range sli {
		if a == str {
			return true
		}
	}
	return false
}

func getClientOrgID(ctx contractapi.TransactionContextInterface) (string, error) {
	clientOrgID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return "", fmt.Errorf("failed getting client orgID: %v", err)
	}
	return clientOrgID, nil
}
