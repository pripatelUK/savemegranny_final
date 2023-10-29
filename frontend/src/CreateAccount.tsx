import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Nav from './Nav';

const CreateAccount: React.FC = () => {
    const navigate = useNavigate();
    const [login, setLogin] = useState(localStorage.getItem('login') || '');
    const [loading, setLoading] = useState(false);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(login);
    // const [loginConfirmed, setLoginConfirmed] = useState(!!localStorage.getItem('login'));

    const onCreate = useCallback(async () => {
        setLoading(true);
        // setLoginConfirmed(true);
        localStorage.setItem('login', login);
        navigate("/account");
    }, [login, navigate]);

    return (

        <div className="flex flex-col w-full h-full">
            {/* <Nav /> */}
            <div className="flex flex-col w-10/12 lg:w-2/6 self-center items-center justify-center h-full mt-10">
                <div className="form-control w-full max-w-xs items-center">
                    <label className="label self-start">
                        <span className="label-text text-lg">Enter Your Email</span>
                    </label>
                    <input
                        type="text"
                        placeholder="john@doe.com"
                        className="input input-bordered glass w-full max-w-xs"
                        value={login}
                        onChange={(e) => {
                            setLogin(e.target.value.toLocaleLowerCase());
                        }}
                    />
                    <button
                        className="btn btn-neutral w-1/2 mt-10"
                        onClick={onCreate}
                        disabled={!isEmailValid || loading}
                    >
                        {loading ? <span className="loading loading-dots"></span> : !isEmailValid ? `Wrong Email` : "Create Wallet!"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateAccount;
