import React, { useState } from 'react';

const Recover: React.FC = () => {
    const [email, setEmail] = useState('');
    const [emailSubmitted, setEmailSubmitted] = useState(false);
    const [signerHash, setSignerHash] = useState('');
    const [proposedChanges, setProposedChanges] = useState('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const isEmailValid = emailRegex.test(email);
    const hasProposedChanges = proposedChanges.trim() !== '';

    const handleSubmitEmail = () => {
        if (isEmailValid) {
            setEmailSubmitted(true);
            // Here, you would typically call an API to get the proposed changes or signerHash
            // For the sake of this example, we will simulate a response with a timeout
            setTimeout(() => {
                // Simulating an API response with proposed changes
                setProposedChanges('Confirm Signer Hash With Owner: \n 0x213123123');
            }, 10000);
        }
    };

    const handleConfirmChanges = () => {
        console.log('Changes confirmed!');
        // Add logic to confirm the changes
    };

    const initRecovery = () => {
        console.log('Signer Hash changed!');
        // Add logic to change the signer hash
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-md shadow-lg max-w-md w-full">
                {!emailSubmitted ? (
                    <div className="flex flex-col items-center">
                        <h1 className="text-2xl font-semibold mb-4">Save Your Grandson</h1>
                        <input
                            type="email"
                            placeholder="Enter email address"
                            className="input input-bordered w-full mb-2"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button className="btn btn-primary w-full" onClick={handleSubmitEmail} disabled={!isEmailValid}>
                            Submit
                        </button>
                    </div>
                ) : hasProposedChanges ? (
                    <div className="flex flex-col items-center">
                        <h1 className="text-2xl font-semibold mb-4">Recover: {email}</h1>
                        <p className="mb-4">{proposedChanges}</p>
                        <button className="btn btn-success w-full" onClick={handleConfirmChanges}>
                            Recover
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <h1 className="text-2xl font-semibold mb-4">Enter Recovery Password</h1>
                        <input
                            type="text"
                            placeholder="Enter signer hash"
                            className="input input-bordered w-full mb-2"
                            value={signerHash}
                            onChange={(e) => setSignerHash(e.target.value)}
                        />
                        <button className="btn btn-primary w-full" onClick={initRecovery} disabled={!signerHash.trim()}>
                            Initiate Recovery
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recover;
