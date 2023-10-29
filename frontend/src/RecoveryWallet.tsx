import axios from 'axios';
import { useCallback, useRef, useState, memo, useMemo } from 'react';
import { Contract, ethers } from 'ethers';
import { IUserOperation, Presets, UserOperationBuilder } from 'userop';
import keypassABI from './abis/keypass.json';
import { simpleAccountAbi, entrypointContract, walletFactoryContract } from './contracts';
import { provider } from './providers';
import {
  getAddress,
  getGasLimits,
  getPaymasterData,
  sendUserOp,
  signUserOp,
  signUserOpWithCreate,
  userOpToSolidity,
} from './passkeyUtils';

function RecoveryWallet() {
  // const webcamRef = useRef<CameraHandle | null>(null);
  const [webcamReady, setWebcamReady] = useState(false);
  // const onWebcamReady = useCallback(() => {
  setWebcamReady(true);
  // }, []);

  const [imageBlob, setImageBlob] = useState<Blob | null>(null);

  const [login, setLogin] = useState(localStorage.getItem('login') || '');

  const [transactionHash, setTransactionHash] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<'waiting' | 'confirmed' | 'error'>();
  const sendTransaction = useCallback(
    async (blob: Blob | null | undefined) => {
      if (!login) throw Error('Login not set');
      if (!blob) throw new Error('no blob');

      setTransactionStatus('waiting');
      console.log('yo login', login);

      // okay so this essentially just creates an address using the username
      const walletAddress = await getAddress(login);
      const pri = await getAddress("pripatel93@gmail.com");
      console.log("pri wallet", pri)
      console.log('yo walletAddress', walletAddress);
      const keypassContract = new Contract(walletAddress, keypassABI.abi, provider);
      const userOpBuilder = new UserOperationBuilder()
        .useDefaults({
          sender: walletAddress,
        })
        .useMiddleware(Presets.Middleware.getGasPrice(provider))
        .setCallData(
          // simpleAccountAbi.encodeFunctionData('execute', [
          //   walletAddress,
          //   0,
          //   keypassContract.interface.encodeFunctionData('addGuardian', [pri]),
          // ]),
          simpleAccountAbi.encodeFunctionData('executeBatch', [
            [walletAddress, walletAddress, walletAddress],
            [0, 0, 0],
            [
              keypassContract.interface.encodeFunctionData('addGuardian', [await getAddress("pripatel93@gmail.com")]),
              keypassContract.interface.encodeFunctionData('addGuardian', [await getAddress("pri@0x27.co.uk")]),
              keypassContract.interface.encodeFunctionData('addGuardian', [await getAddress("asdasdasd")])
            ],
          ]),
          // executeBatch(address[], uint256[], bytes[])
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
      console.log('TO SIGN', { userOpHash });
      const loginPasskeyId = localStorage.getItem(`${login}_passkeyId`);
      const signature = loginPasskeyId
        ? await signUserOp(userOpHash, loginPasskeyId)
        : await signUserOpWithCreate(userOpHash, login);

      if (!signature) throw new Error('Signature failed');
      const signedUserOp: IUserOperation = {
        ...userOp,
        paymasterAndData: await getPaymasterData(userOp),
        signature,
      };
      console.log({ signedUserOp });
      console.log('signed', userOpToSolidity(signedUserOp));

      sendUserOp(signedUserOp)
        .then(async (receipt) => {
          await receipt.wait();
          setTransactionHash(receipt.hash);
          setTransactionStatus('confirmed');
          console.log({ receipt });
        })
        .catch((e) => {
          setTransactionStatus('error');
          console.error(e);
        });
    },
    [login, imageBlob],
  );

  const cameraRequested = true; // this was part of "home"
  const onScreenshot = useCallback(async () => {
    if (!cameraRequested) throw new Error('Camera is not set');
    const blob = new Blob([])
    // const { blob } = (await webcamRef.current?.takeScreenshot()) || {};
    setImageBlob(blob || null);
    console.log('yo in');
    sendTransaction(blob);
  }, [imageBlob, login, cameraRequested]);

  return (
    <div className="flex flex-col w-10/12 lg:w-2/6 self-center items-center justify-center h-full">
      <div className="flex flex-col w-full h-full justify-center items-center">
        <div className="pt-10 w-9/12 flex align-center justify-between gap-2 flex-wrap">
          {!imageBlob && (
            <button className="btn btn-secondary flex-grow" onClick={onScreenshot} disabled={!webcamReady}>
              {webcamReady ? 'Take a selfie !' : <span className="loading loading-dots"></span>}
            </button>
          )}
          {imageBlob && transactionStatus === 'waiting' && (
            <button className="btn btn-secondary flex-grow" disabled>
              <span className="loading loading-dots"></span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(RecoveryWallet);
