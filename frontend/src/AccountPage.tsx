import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from './Nav';

interface User {
    email: string;
}

const AccountPage: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([
        // Example users, replace with actual user data
        // { email: 'user1@example.com' },
        // { email: 'user2@example.com' },
    ]);

    const handleNavigateToRecoverSetup = () => {
        navigate('/setup-recover');
    };

    return (
        <div className="flex flex-col w-full h-full">
            <Nav />
            <div className="flex flex-col w-10/12 lg:w-2/6 self-center items-center justify-center h-full mt-10">
                {users.length === 0 ? (
                    <>
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                            <p className="font-bold">Wallet Recovery Not Set Up</p>
                            <p>To secure your account, add trusted contacts who can help you recover your wallet if you lose access.</p>
                        </div>
                        <button
                            className="btn btn-neutral w-1/2"
                            onClick={handleNavigateToRecoverSetup}
                        >
                            Setup Recovery
                        </button>
                    </>
                ) : (
                    <div className="w-full max-w-xs">
                        <h2 className="text-lg mb-4">Existing Users:</h2>
                        <ul>
                            {users.map((user, index) => (
                                <li key={index} className="mb-2">
                                    {user.email}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountPage;
