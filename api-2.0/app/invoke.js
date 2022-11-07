const { Gateway, Wallets, TxEventHandler, GatewayOptions, DefaultEventHandlerStrategies, TxEventHandlerFactory } = require('fabric-network');
const fs = require('fs');
const EventStrategies = require('fabric-network/lib/impl/event/defaulteventhandlerstrategies');
const path = require("path")
const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');
const util = require('util')

const helper = require('./helper');
const { blockListener, contractListener } = require('./Listeners');

const invokeTransaction = async (channelName, chaincodeName, fcn, args, username, org_name, transientData) => {
    try {
        console.log("=----------checkpoint 11--------------", )
        const ccp = await helper.getCCP(org_name);
        console.log("========2222==========", channelName, chaincodeName, fcn, args, username, org_name,transientData)

        const walletPath = await helper.getWalletPath(org_name);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        
        let identity = await wallet.get(username);
        if (!identity) {
            console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`);
            await helper.getRegisteredUser(username, org_name, true)
            identity = await wallet.get(username);
            console.log('Run the registerUser.js application before retrying');
            return;
        }


        const connectOptions = {
            wallet, identity: username, discovery: { enabled: true, asLocalhost: true }
            // eventHandlerOptions: EventStrategies.NONE
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, connectOptions);

        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);

        // Multiple smartcontract in one chaincode
        let result;
        let message;
        let transientDataBuffer
        let key ;

        
        switch (fcn) {
           
            case 'CreateParcel':
                console.log("=======checkpoint CreateParcel1======")
                console.log(`Transient data is : ${transientData}`)
                let parcelData = JSON.parse(transientData)
                console.log(`car data is : ${JSON.stringify(parcelData)}`)
                key = Object.keys(parcelData)[0]
                console.log("=======checkpoint CreateParcel2======")
                transientDataBuffer = {}
                transientDataBuffer[key] = Buffer.from(JSON.stringify(parcelData[key]))
                result = await contract.createTransaction(fcn).setEndorsingOrganizations('Org1MSP').setTransient(transientDataBuffer).submit();
                console.log("=======checkpoint CreateParcel3======")
                result = {ParcelID: result.toString()}
                break;
            case 'CustomerAgreement':
                console.log("=======checkpoint CustomerAgreement1======", args)
                console.log(`Transient data is : ${transientData}`)
                let agreementData = JSON.parse(transientData)
                console.log(`car data is : ${JSON.stringify(agreementData)}`)
                key = Object.keys(agreementData)[0]
                transientDataBuffer = {}
                console.log("=======checkpoint CustomerAgreement2======-------------------------", key, agreementData, agreementData[key])
                transientDataBuffer[key] = Buffer.from(JSON.stringify(agreementData[key]))
                result = await contract.createTransaction(fcn).setEndorsingOrganizations('Org2MSP').setTransient(transientDataBuffer).submit(args[0], args[1], args[2]);
                console.log("=======checkpoint CustomerAgreement3======")
                result = {Data: result.toString(), message: 'Customer agreed for Parcel'}
                break;
            case 'CreateOrder':
                // result = await contract.submitTransaction(fcn, args[0], args[1], args[2], args[3]);
                // result = await contract.createTransaction(fcn).setEndorsingOrganizations('Org1MSP').submit(args[0], args[1], args[2]);
                result = await contract.createTransaction(fcn).submit(args[0], args[1], args[2]);
                result = {data: JSON.parse(result.toString())}
                break;
            case 'Bid':
                console.log("=======checkpoint Bid1======")
                console.log(`Transient data is : ${transientData}`)
                let bidData = JSON.parse(transientData)
                console.log(`bidData data before is : ${bidData}`)
                let clientId = `x509::CN=${username},OU=client+OU=org1+OU=department1::CN=fabric-ca-server,OU=Fabric,O=Hyperledger,ST=North Carolina,C=US`
                bidData.bid.courier = clientId

                console.log(`Transient data after is : ${bidData}`)
                console.log(`car data is : ${JSON.stringify(bidData)}`)
                key = Object.keys(bidData)[0]
                transientDataBuffer = {}
                console.log("=======checkpoint Bid2======")
                
                transientDataBuffer[key] = Buffer.from(JSON.stringify(bidData[key]))
                // result = await contract.createTransaction(fcn).setTransient(transientDataBuffer).submit(args[0], args[1]);
                result = await contract.createTransaction(fcn).setEndorsingOrganizations('Org3MSP').setTransient(transientDataBuffer).submit(args[0]);
                console.log("=======checkpoint Bid3======")
                result = {bidTxID: result.toString()}
                break;
                
            case 'SubmitBid':
                result = await contract.createTransaction(fcn).setEndorsingOrganizations('Org1MSP', 'Org3MSP').submit(args[0], args[1]);
                // result = await contract.submitTransaction(fcn, args[0], args[1]);
                result = {Result: 'Bid submitted successfully'}
                break;

            case 'CloseOrderBid':
                // result = await contract.submitTransaction(fcn, args[0], args[1]);
                result = await contract.createTransaction(fcn).setEndorsingOrganizations('Org1MSP','Org3MSP').submit(args[0], args[1]);
                result = {Result: 'Order Bid closed successfully'}
                break;

            case 'RevealBid':
                console.log("=======checkpoint RevealBid1======")
                console.log(`Transient data is : ${transientData}`)
                let bidData2 = JSON.parse(transientData)
                console.log(`car data is : ${JSON.stringify(bidData2)}`)

                let clientId2 = `x509::CN=${username},OU=client+OU=org1+OU=department1::CN=fabric-ca-server,OU=Fabric,O=Hyperledger,ST=North Carolina,C=US`
                bidData2.bid.courier = clientId2

                key = Object.keys(bidData2)[0]
                console.log("=======checkpoint RevealBid2======----------------------------------", bidData2)
                transientDataBuffer = {}
                transientDataBuffer[key] = Buffer.from(JSON.stringify(bidData2[key]))
                result = await contract.createTransaction(fcn).setEndorsingOrganizations('Org1MSP', 'Org3MSP').setTransient(transientDataBuffer).submit(args[0], args[1]);
                console.log("=======checkpoint RevealBid3======")
                result = {Result: "Bid revealed successfully"}
                break;

            case 'AssignCourier':
                // result = await contract.submitTransaction(fcn, args[0], args[1], args[2], args[3]);
                result = await contract.createTransaction(fcn).setEndorsingOrganizations('Org1MSP').submit(args[0], args[1], args[2]);
                result = {Result: "Courier Assigned successfully"}
                break;

            case 'CourierArrived':
                result = await contract.createTransaction(fcn).setEndorsingOrganizations('Org3MSP').submit(args[0], args[1]);
                result = {message: "Courier confirmed location arrival successfully"}
                break;

            case 'OutForDelivery':
                result = await contract.createTransaction(fcn).setEndorsingOrganizations('Org1MSP').submit(args[0], args[1], args[2]);
                result = {message: "Parcel and Order state updated to Out For Delivery successfully"}
                break;

            case 'ReceiveParcel':
                result = await contract.createTransaction(fcn).setEndorsingOrganizations('Org2MSP').submit(args[0]);
                result = {message: "Parcel Received by Customer successfully"}
                break;

            case 'Handover':
                result = await contract.createTransaction(fcn).setEndorsingOrganizations('Org3MSP').submit(args[0], args[1]);
                result = {message: "Parcel Handovered to Customer successfully"}
                break;

            case 'CompleteOrder': 
                result = await contract.createTransaction(fcn).setEndorsingOrganizations('Org1MSP').submit(args[0], args[1], args[2]);
                result = {message: "Parcel Delivered and Order Completed successfully"}
                break;

            case 'CancelOrder':
                let orderString = await contract.evaluateTransaction('QueryOrder', args[0]);
                let orderJSON = JSON.parse(orderString); 
                if (orderJSON.organizations.length ===2){
                    result = await contract.createTransaction(fcn).setEndorsingOrganizations('Org1MSP', 'Org3MSP').submit(args[0], args[1]);
                    result = {Result: 'Order has been cancelled successfully'}
                }else {
                    result = await contract.createTransaction(fcn).setEndorsingOrganizations('Org1MSP').submit(args[0], args[1]);
                    result = {message: 'Order has been cancelled successfully'}
                }
                break;


            case "CreatePrivateDataImplicitForOrg1":
            case 'CreateContract':
            case "CreateCar":
                result = await contract.submitTransaction(fcn, args[0]);
                result = {txid: result.toString()}
                break;
            case "UpdateCarOwner":
                console.log("=============")
                result = await contract.submitTransaction('SmartContract:'+fcn, args[0], args[1]);
                result = {txid: result.toString()}
                break;
            case "CreateDocument":
                result = await contract.submitTransaction('DocumentContract:'+fcn, args[0]);
                console.log(result.toString())
                result = {txid: result.toString()}
                break;
            default:
                break;
        }

        await gateway.disconnect();

        // result = JSON.parse(result.toString());

        let response = {
            message: message,
            result
        }

        return response;


    } catch (error) {
        console.log("=======checkpoint 31111======",error)

        console.log(`Getting error: ${error}`)
        return error.message

    }
}

exports.invokeTransaction = invokeTransaction;