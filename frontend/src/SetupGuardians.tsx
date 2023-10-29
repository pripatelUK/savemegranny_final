import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Contract, ethers } from 'ethers';
import { IUserOperation, Presets, UserOperationBuilder } from 'userop';
import keypassABI from './abis/keypass.json';
import { simpleAccountAbi, entrypointContract, walletFactoryContract } from './contracts';
import { provider } from './providers';
import { getAddress, getGasLimits, getPaymasterData, sendUserOp, signUserOp, signUserOpWithCreate, userOpToSolidity } from './passkeyUtils';

interface EmailCardProps {
    email: string;
    onRemove: (email: string) => void;
}

const EmailCard: React.FC<EmailCardProps> = ({ email, onRemove }) => (
    <div className="bg-white p-4 rounded-md shadow-md flex justify-between items-center mb-4">
        <span>{email}</span>
        <button className="btn btn-error btn-xs" onClick={() => onRemove(email)}>Remove</button>
    </div>
);

const SetupGuardians: React.FC = () => {
    const navigate = useNavigate();
    const [emails, setEmails] = useState<string[]>([]);
    const [emailInput, setEmailInput] = useState('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(emailInput) && !emails.includes(emailInput);
    const guardians = localStorage.getItem("guardians");
    const login = localStorage.getItem('login');
    if (!login) throw Error('Login not set');

    const guardiansObj = guardians?.length ? JSON.parse(guardians) : {};
    const count = guardiansObj[login]?.guardians.length || 0;
    const minimumEmailsMet = emails.length >= Math.max(3 - count, 1);


    const handleAddEmail = () => {
        if (isEmailValid) {
            setEmails([...emails, emailInput]);
            setEmailInput('');
        }
    };

    const handleRemoveEmail = (email: string) => {
        setEmails(emails.filter(e => e !== email));
    };

    const [transactionHash, setTransactionHash] = useState('');
    const [transactionStatus, setTransactionStatus] = useState<'waiting' | 'confirmed' | 'error'>();
    const handleSign = async () => {

        setTransactionStatus('waiting');
        console.log('yo login', login);

        // okay so this essentially just creates an address using the username
        const walletAddress = await getAddress(login);
        const keypassContract = new Contract(walletAddress, keypassABI.abi, provider);
        console.log('yo walletAddress', walletAddress);
        const emailToAddr: any = []
        for (let index = 0; index < emails.length; index++) {
            emailToAddr.push(await getAddress(emails[index]));
        }
        console.log("guardians:", emailToAddr)
        const userOpBuilder = new UserOperationBuilder()
            .useDefaults({
                sender: walletAddress,
            })
            .useMiddleware(Presets.Middleware.getGasPrice(provider))
            .setCallData(
                simpleAccountAbi.encodeFunctionData('executeBatch', [
                    emails.map(e => walletAddress),
                    emails.map(e => 0),
                    emails.map((e, i) => keypassContract.interface.encodeFunctionData('addGuardian', [emailToAddr[i]]))
                ]),
            )
            .setNonce(await entrypointContract.getNonce(walletAddress, 0));

        const walletCode = await provider.getCode(walletAddress);
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
                const guardians = localStorage.getItem("guardians");
                const guardiansObj = guardians?.length ? JSON.parse(guardians) : {};
                emails.forEach(e => {
                    guardiansObj[login] = guardiansObj[login] || {};
                    guardiansObj[login].guardians = guardiansObj[login].guardians || [];
                    guardiansObj[login].guardians.push(e)
                })
                localStorage.setItem("guardians", JSON.stringify(guardiansObj));
                console.log("guardian count:", await keypassContract.functions.guardianCount())
                navigate("/account");
            })
            .catch((e: any) => {
                setTransactionStatus('error');
                console.error(e);
            });
    }
    //     [login, imageBlob],
    // );

    return (
        <div className="flex flex-col w-full h-full">
            {/* <button className="btn btn-outline mb-4" onClick={() => navigate(-1)}>Back</button> */}
            <div className="w-full flex justify-start items-center mt-4 px-4">
                <button className="btn btn-outline" onClick={() => navigate(-1)}>Back</button>
            </div>
            <div className="flex flex-col w-10/12 lg:w-2/6 self-center items-center justify-center h-full mt-2">
                <h1 className="text-2xl font-semibold mb-10">Setup Biometric Social Recovery</h1>

                {emails.length > 0 && (
                    <div className="mb-12 mt-4 w-3/4">
                        {/* <h3 className="text-lg mb-2">Emails for Wallet Recovery:</h3> */}
                        {emails.map(email => (
                            <EmailCard key={email} email={email} onRemove={handleRemoveEmail} />
                        ))}
                    </div>
                )}

                <div className="mb-4 flex flex-col items-center w-3/4">
                    <input
                        type="email"
                        placeholder="Enter email address"
                        className="input input-bordered w-full mb-2"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                    />
                    <button className="btn btn-primary w-full" onClick={handleAddEmail} disabled={!isEmailValid}>
                        Add Email
                    </button>
                </div>

                <button
                    className="btn btn-success mt-4 w-3/4"
                    onClick={handleSign}
                    disabled={!minimumEmailsMet}
                >
                    {minimumEmailsMet ? 'Request Signatures' : 'Add at least 3 emails'}
                </button>
            </div>
        </div>
    );
};

export default SetupGuardians;
