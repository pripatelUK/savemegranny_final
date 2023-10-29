import { Button, Alert } from "@mui/material";
import {
    EtherspotContractTransaction,
    EtherspotBatches,
    EtherspotBatch,
    useEtherspotTransactions
} from "@etherspot/transaction-kit";
import { utils } from "ethers";

export default function AddGuardians(props) {
    const { estimate, send } = useEtherspotTransactions();

    const estimateAndTransact = async () => {
        const estimateData = await estimate();
        console.log("Estimate Data:", estimateData);

        if (JSON.stringify(estimateData).includes("reverted")) {
            alert("Tx reverted!");
            return;
        }

        const sendData = await send();
        console.log("Send Data:", sendData);
    };

    return (
        <>
            {props.hasAddedGuardians ? (
                <Alert severity="success">
                    The transaction to add guardians was sent
                </Alert>
            ) : (
                <EtherspotBatches
                    onEstimated={props.onEstimateReceiver}
                    onSent={props.onSetHasAddedGuardians}
                >
                    <EtherspotBatch chainId={80001}>
                        <EtherspotContractTransaction
                            contractAddress={props.mumbaiSmartWalletAddress}
                            abi={["function guardianCosign()"]}
                            methodName={"guardianCosign"}
                            params={[]}
                        >
                        </EtherspotContractTransaction>
                        <Button onClick={() => estimateAndTransact()} variant="outlined">
                            SEND TX
                        </Button>
                    </EtherspotBatch>
                </EtherspotBatches >
            )
            }
        </>
    );
}