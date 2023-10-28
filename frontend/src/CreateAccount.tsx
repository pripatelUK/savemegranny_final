import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateAccount: React.FC = () => {
    const navigate = useNavigate();
    const [login, setLogin] = useState(localStorage.getItem('login') || '');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(login);
    // const [loginConfirmed, setLoginConfirmed] = useState(!!localStorage.getItem('login'));
    return (
        <div className="flex flex-col w-10/12 lg:w-2/6 self-center items-center justify-center h-full">
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
                    onClick={() => {
                        // setLoginConfirmed(true);
                        localStorage.setItem('login', login);
                        navigate("/account");
                    }}
                    disabled={!isEmailValid}
                >
                    {!isEmailValid ? `Wrong Email` : "Let's Go!"}
                </button>
            </div>
        </div>
    );
}

export default CreateAccount;
