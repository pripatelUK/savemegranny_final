import React, { useState } from 'react';
import { getAddress, getGasLimits, getPaymasterData, sendUserOp, signUserOp, signUserOpWithCreate, userOpToSolidity } from './passkeyUtils';
import { Contract, ethers } from 'ethers';
import { IUserOperation, Presets, UserOperationBuilder } from 'userop';
import { provider } from './providers';
import { entrypointContract, simpleAccountAbi, walletFactoryContract } from './contracts';
import base64url from 'base64url'
import { useNavigate } from 'react-router-dom';;
import keypassABI from './abis/keypass.json';

const Recover: React.FC = () => {
    const navigate = useNavigate();
    const [input, setInput] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [proposedChanges, setProposedChanges] = useState('');

    const hasProposedChanges = proposedChanges.trim() !== '';

    // const handleSubmit = () => {
    //     setIsSubmitted(true);
    //     // Here, you would typically call an API to get the proposed changes or validate the input
    //     // For the sake of this example, we will simulate a response with a timeout
    //     setTimeout(() => {
    //         // Simulating an API response with proposed changes
    //         setProposedChanges('Confirm Signer Hash With Owner: \n 0x213123123');
    //     }, 1000);
    // };

    const [transactionHash, setTransactionHash] = useState('');
    const [transactionStatus, setTransactionStatus] = useState<'waiting' | 'confirmed' | 'error'>();
    const handleSign = async () => {
        const decoded = base64url.decode(input)
        console.log(decoded)
        const payload = decoded.split(",");
        console.log(payload)
        setIsSubmitted(true);
        const login = localStorage.getItem('login');
        if (!login) throw Error('Login not set');

        setTransactionStatus('waiting');
        console.log('yo login', login);
        const myAddress = await getAddress(login);
        // const pw = base64url.encode(`${pubKeyCoordinates[0]},${pubKeyCoordinates[1]},${credId},${walletAddress}`);
        const walletAddress = payload[3];
        const pubKeyCoordinates = [payload[0], payload[1]];
        const credId = payload[2];

        // okay so this essentially just creates an address using the username
        // const walletAddress = await getAddress(login);
        const keypassContract = new Contract(walletAddress, keypassABI.abi, provider);
        console.log('yo walletAddress', walletAddress);
        const userOpBuilder = new UserOperationBuilder()
            .useDefaults({
                sender: myAddress,
            })
            .useMiddleware(Presets.Middleware.getGasPrice(provider))
            .setCallData(
                // addSigner(bytes, uint256[2])
                simpleAccountAbi.encodeFunctionData('execute', [
                    walletAddress,
                    0,
                    // keypassContract.interface.encodeFunctionData('guardianPropose', [credId, pubKeyCoordinates])
                    keypassContract.interface.encodeFunctionData('guardianCosign', [])
                ]),
            )
            .setNonce(await entrypointContract.getNonce(myAddress, 0));

        const walletCode = await provider.getCode(myAddress);
        console.log('yo walletCode', walletCode);
        const walletExists = walletCode !== '0x';
        console.log('yo walletExists', walletExists);
        console.log({ walletExists });

        if (!walletExists) {
            userOpBuilder.setInitCode(
                walletFactoryContract.address +
                walletFactoryContract.interface.encodeFunctionData('createAccount(string, uint256)', [login, 0]).slice(2),
            );
        }

        const { chainId } = await provider.getNetwork();
        const userOpToEstimateNoPaymaster = await userOpBuilder.buildOp(import.meta.env.VITE_ENTRYPOINT, chainId);
        const paymasterAndData = await getPaymasterData(userOpToEstimateNoPaymaster);
        const userOpToEstimate = {
            ...userOpToEstimateNoPaymaster,
            paymasterAndData,
        };
        console.log({ userOpToEstimate });
        console.log('estimated userop', userOpToSolidity(userOpToEstimate));

        const [gasLimits, baseUserOp] = await Promise.all([
            getGasLimits(userOpToEstimate),
            userOpBuilder.buildOp(import.meta.env.VITE_ENTRYPOINT, chainId),
        ]);
        console.log({
            gasLimits: Object.fromEntries(
                Object.entries(gasLimits).map(([key, value]) => [key, ethers.BigNumber.from(value).toString()]),
            ),
        });
        const userOp: IUserOperation = {
            ...baseUserOp,
            callGasLimit: gasLimits.callGasLimit,
            preVerificationGas: gasLimits.preVerificationGas,
            verificationGasLimit: gasLimits.verificationGasLimit,
            paymasterAndData,
        };

        console.log({ userOp });
        // console.log('to sign', userOpToSolidity(userOp));
        const userOpHash = await entrypointContract.getUserOpHash(userOp);
        // const userOpHash = "0x711a19f8418ca174fc7e215419af62c6097d8fa23bb8894cc55a090a1738d6d9";
        // console.log("guardian count:", await keypassContract.guardianCount())
        console.log('TO SIGN', { userOpHash });
        const loginPasskeyId = localStorage.getItem(`${login}_passkeyId`);
        const signature = loginPasskeyId
            ? await signUserOp(userOpHash, loginPasskeyId)
            : await signUserOpWithCreate(userOpHash, login);

        if (!signature) throw new Error('Signature failed');
        const signedUserOp: IUserOperation = {
            ...userOp,
            // paymasterAndData: await getPaymasterData(userOp),
            signature,
        };
        console.log({ signedUserOp });
        console.log('signed', userOpToSolidity(signedUserOp));
        // console.log("guardian count:", await keypassContract.guardianCount())

        sendUserOp(signedUserOp)
            .then(async (receipt: any) => {
                await receipt.wait();
                setTransactionHash(receipt.hash);
                setTransactionStatus('confirmed');
                console.log({ receipt });
                // console.log({ events });
                const recovery = localStorage.getItem("recovery");
                const recoveryObj = recovery?.length ? JSON.parse(recovery) : {};
                const guardians = localStorage.getItem("guardians");
                const guardiansObj = guardians?.length ? JSON.parse(guardians) : {};
                const signerEmails = Object.keys((guardiansObj as any));
                for (let index = 0; index < signerEmails.length; index++) {
                    const signerWallet = await getAddress(signerEmails[index]);
                    if (signerWallet == walletAddress) {
                        const email = signerEmails[index];
                        recoveryObj[email] = guardiansObj[email].guardians.filter(e => e !== email);
                        break;
                    }
                }
                localStorage.setItem("recovery", JSON.stringify(recoveryObj));
                navigate("/account");
            })
            .catch((e: any) => {
                setTransactionStatus('error');
                console.error(e);
            });
    }

    return (
        <div className="flex flex-col w-full h-full">
            <div className="w-full flex justify-start items-center mt-4 px-4">
                <button className="btn btn-outline" onClick={() => navigate(-1)}>Back</button>
            </div>
            <div className="flex flex-col w-10/12 lg:w-2/6 self-center items-center justify-center h-full mt-2">
                <div className="flex flex-col items-center w-3/4">
                    {!isSubmitted ? (
                        <>
                            <h1 className="text-2xl font-semibold mb-4">Save Your Grandson</h1>
                            <textarea
                                placeholder="Enter his passphrase"
                                className="textarea textarea-bordered w-full mb-2"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button className="btn btn-primary w-full" onClick={handleSign}>
                                Confirm
                            </button>
                        </>
                    ) : hasProposedChanges ? (
                        <>
                            <h1 className="text-2xl font-semibold mb-4">Recover</h1>
                            <p className="mb-4">{proposedChanges}</p>
                        </>
                    ) : (
                        <p className="text-lg">Processing...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Recover;
