import homeImg from './assets/lady.svg';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


const HomePage: React.FC = () => {
    // const [login, setLogin] = useState(localStorage.getItem('login') || '');
    // const [loginConfirmed, setLoginConfirmed] = useState(!!localStorage.getItem('login'));
    const navigate = useNavigate();
    const onSelect = () => {
        // console.log(!!localStorage.getItem('login'))
        if (localStorage.getItem('login')) {
            navigate('/account');
        } else {
            navigate('/create');
        }
        // ... any other logic you want to run when the button is clicked
    };

    const onRecover = () => {
        // console.log(!!localStorage.getItem('login'))
        // if (localStorage.getItem('login')) {
        //     navigate('/account');
        // } else {
        navigate('/recover');
        // }
        // ... any other logic you want to run when the button is clicked
    };
    const onRecoverSetup = () => {
        // console.log(!!localStorage.getItem('login'))
        // if (localStorage.getItem('login')) {
        //     navigate('/account');
        // } else {
        navigate('/recover-setup');
        // }
        // ... any other logic you want to run when the button is clicked
    };
    return (
        <div className="flex flex-col w-10/12 lg:w-2/6 self-center items-center justify-center h-full">
            <img className="w-full mb-12" src={homeImg} alt="" />
            {/* <Link to="/account" className="btn btn-primary w-3/4 break-words">
                Granny Save Me!!
            </Link> */}
            <button className="btn btn-secondary w-3/4 break-words mb-4" onClick={onSelect}>
                Sign In
            </button>
            <button className="btn btn-primary w-3/4 break-words mb-4" onClick={onRecoverSetup}>
                Save Me Granny
            </button>
            <button className="btn btn-success w-3/4 break-words" onClick={onRecover}>
                Save Your Grandson
            </button>
        </div >
    );
}

export default HomePage;
