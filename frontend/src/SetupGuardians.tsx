import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    const minimumEmailsMet = emails.length >= 3;

    const handleAddEmail = () => {
        if (isEmailValid) {
            setEmails([...emails, emailInput]);
            setEmailInput('');
        }
    };

    const handleRemoveEmail = (email: string) => {
        setEmails(emails.filter(e => e !== email));
    };

    const handleSign = () => {
        console.log('Signing with:', emails);
        // Add your signing logic here
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-md shadow-lg max-w-md w-full">
                <h1 className="text-2xl font-semibold mb-4">Setup Biometric Social Recovery</h1>
                <button className="btn btn-outline mb-4" onClick={() => navigate(-1)}>Back</button>

                {emails.length > 0 && (
                    <div className="mb-12 mt-4">
                        {/* <h3 className="text-lg mb-2">Emails for Wallet Recovery:</h3> */}
                        {emails.map(email => (
                            <EmailCard key={email} email={email} onRemove={handleRemoveEmail} />
                        ))}
                    </div>
                )}

                <div className="mb-4 flex flex-col items-center">
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
                    className="btn btn-success mt-4 w-full"
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
