import React, { useState } from 'react';
import { decodeRegistrationCredential } from './debugger/decodeRegistrationCredential';
import base64url from 'base64url';
import { startRegistration } from '@simplewebauthn/browser';
import { v4 as uuid } from 'uuid';
import { getAddress } from './passkeyUtils';

const RecoverSetup: React.FC = () => {
    const [email, setEmail] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [wallet, setWallet] = useState('');
    const [hasGenerated, setHasGenerated] = useState(false);
    const [loading, setLoading] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);

    const generatePassphrase = async () => {
        setLoading(true);
        // setTimeout(() => {
        //     const newPassphrase = 'random-passphrase'; // Replace with actual passphrase generation logic
        //     setPassphrase(newPassphrase);
        //     setHasGenerated(true);
        //     setLoading(false);
        // }, 1000); // Simulating asynchronous operation


        // console.log({ userOpHash });
        const userOpHash = "0xa0af042a3680500f4d855ceac5ae79800cb662eb83b7005e68eef88adfb03e8e"
        const challenge = Buffer.from(userOpHash.slice(2), 'hex');
        const encodedChallenge = base64url.encode(challenge);
        console.log('base6url challenge', base64url.encode(challenge));

        const passkey = await startRegistration({
            rp: {
                name: 'WebAuthn.io (Dev)',
                id: 'localhost',
            },
            user: {
                id: base64url.encode(uuid()),
                name: `${email} ${new Date().toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })}`,
                displayName: email,
            },
            challenge: base64url.encode(challenge),
            pubKeyCredParams: [
                {
                    type: 'public-key',
                    alg: -7,
                },
            ],
            timeout: 60000,
            authenticatorSelection: {
                // authenticatorAttachment: 'platform', // can prevent simulator from running the webauthn request
            },
            attestation: 'direct',
        });
        const credId = `0x${base64url.toBuffer(passkey.id).toString('hex')}`;
        localStorage.setItem(`${email}_passkeyId`, credId);
        console.log({ credId });
        console.log('webauthn response', passkey);
        const decodedPassKey = decodeRegistrationCredential(passkey);

        console.log('decoded webauthn response', decodedPassKey);

        const supportsDirectAttestation = !!decodedPassKey.response.attestationObject.attStmt.sig;
        console.log({ supportsDirectAttestation });

        const pubKeyCoordinates = [
            '0x' +
            base64url
                .toBuffer(decodedPassKey.response.attestationObject.authData.parsedCredentialPublicKey?.x || '')
                .toString('hex'),
            '0x' +
            base64url
                .toBuffer(decodedPassKey.response.attestationObject.authData.parsedCredentialPublicKey?.y || '')
                .toString('hex'),
        ];
        const walletAddress = await getAddress(email);
        const pw = base64url.encode(`${pubKeyCoordinates[0]},${pubKeyCoordinates[1]},${credId},${walletAddress}`);
        setPassphrase(pw);
        setWallet(walletAddress);
        console.log(base64url.decode(pw));
        setHasGenerated(true);
        setLoading(false);
    };

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex flex-col w-10/12 lg:w-2/6 self-center items-center justify-center h-full mt-10">
                <div className="form-control w-full max-w-xs items-center">
                    {!hasGenerated ? (
                        <>
                            <h1 className="text-2xl font-bold mb-6">Generate New Passkey</h1>
                            <input
                                type="text"
                                placeholder="Enter email address"
                                className="input input-bordered w-full max-w-xs"
                                value={email}
                                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                            />
                            <button
                                className="btn btn-neutral w-1/2 mt-10"
                                onClick={generatePassphrase}
                                disabled={!isEmailValid || loading}
                            >
                                {loading ? <span className="loading loading-dots"></span> : !isEmailValid ? `Invalid Email` : "Generate"}
                            </button>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold mb-6">Give This To Granny!</h1>
                            <h4 className="text-l font-bold mb-6 break-all">Account: {wallet}</h4>
                            {/* <h4 className="text-l font-bold mb-6">Tell her to open the 'Save Your Grandson' button</h4> */}
                            <h4 className="text-l font-bold mb-2">Passphrase</h4>
                            <p className="text-lg break-all" style={{ wordBreak: 'break-all' }}>{passphrase}</p>

                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecoverSetup;
