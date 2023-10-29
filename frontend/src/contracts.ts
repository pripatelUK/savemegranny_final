import { ethers, Contract } from 'ethers';
import walletFactory from './abis/keypassFactory.json';
import simpleAccount from './abis/simpleAccount.json';
import entrypoint from './abis/entrypoint.json';
import { provider } from './providers';

export const simpleAccountAbi = new ethers.utils.Interface(simpleAccount.abi);
export const entrypointContract = new Contract(import.meta.env.VITE_ENTRYPOINT, entrypoint.abi, provider);
export const walletFactoryContract = new Contract(
  import.meta.env.VITE_WALLETFACTORY_CONTRACT,
  walletFactory.abi,
  provider,
);
