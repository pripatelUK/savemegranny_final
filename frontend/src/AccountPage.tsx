import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Nav from './Nav';
import keypassABI from './abis/keypass.json';
import { Contract } from 'ethers';
import { getAddress } from './passkeyUtils';
import { provider } from './providers';

interface Guardian {
    email: string;
    wallet: string;
}

// function getRecoverees(guardiansObj: any) {

// }

const AccountPage: React.FC = () => {
    const navigate = useNavigate();
    const login = localStorage.getItem('login');
    const [guardians, setGuardians] = useState<Guardian[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!login) {
                navigate('/');
                return;
            }
            const walletAddress = await getAddress(login);
            const guardians = localStorage.getItem("guardians");
            const guardiansObj = guardians?.length ? JSON.parse(guardians) : {};

            const guards = []
            console.log(guardiansObj[login])
            if (guardiansObj[login] && guardiansObj[login].guardians) {
                for (let index = 0; index < guardiansObj[login].guardians.length; index++) {
                    const email = guardiansObj[login].guardians[index];
                    const wallet = await getAddress(guardiansObj[login].guardians[index])
                    guards.push({ email, wallet })
                }
            }
            setGuardians(guards);

        };

        fetchData();
    }, [login, navigate]);

    const handleNavigateToRecoverSetup = () => {
        navigate('/setup');
    };

    const handleGoBack = () => {
        navigate(-1);
    };
    const onRecover = () => {
        navigate('/recover');
    };
    const addGuardians = () => {
        navigate('/setup');
    };

    return (
        <div className="flex flex-col w-full h-full">
            {/* <Nav /> */}
            <div className="w-full flex justify-start items-center mt-4 px-4">
                <button className="btn btn-outline" onClick={handleGoBack}>Back</button>
            </div>
            <div className="flex flex-col w-10/12 lg:w-2/6 self-center items-center justify-center h-full mt-2">
                {guardians?.length === 0 ? (
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
                    <div className="w-full max-w-md mx-auto">
                        <h1 className="text-2xl font-bold mb-6 text-center">Guardians</h1>
                        <div>
                            {guardians?.map((guardian, index) => (
                                <div key={index} className="bg-white p-4 rounded-md shadow-md mb-4">
                                    <div>
                                        <p className="text-lg font-semibold">{guardian.email}</p>
                                        <p className="text-sm text-gray-600">Passkey: {guardian.wallet}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <button className="btn btn-secondary w-2/4 break-words mt-5" onClick={addGuardians}>
                    Add Guardians
                </button>
                <button className="btn btn-success w-2/4 break-words mt-5" onClick={onRecover}>
                    Save Your Grandson
                </button>
                <button className="btn btn-primary w-1/4 break-words mt-10" onClick={() => {
                    localStorage.removeItem("login")
                    navigate("/")
                }}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default AccountPage;
