import { Web3Provider } from "@ethersproject/providers";
import { WalletConnectConnector} from "@web3-react/walletconnect-connector";
import { InjectedConnector } from "@web3-react/injected-connector";
import {Buffer} from "buffer";
import { ethers } from "ethers";

export const ETHEREUM_NETWORK_ID = 1;
export const SEPOLIA_NETWORK_ID = 11155111;
export const LOCAL_NETWORK_ID = 31337; 

if(!window.Buffer) {
  window.Buffer = Buffer;  
}

export const walletConnectConnector = new WalletConnectConnector({
  rpc: { [SEPOLIA_NETWORK_ID]: process.env.REACT_APP_API_URL },
  qrcode: true
 });


export const getLibrary = (provider) => {
  const library = new Web3Provider(provider);
  return library;
}

export const localProvider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_LOCAL_PROVIDER_URL); 

export const injectedConnector = new InjectedConnector({ supportedChainIds: 
    [ETHEREUM_NETWORK_ID, SEPOLIA_NETWORK_ID, LOCAL_NETWORK_ID] });

