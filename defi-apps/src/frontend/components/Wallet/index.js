import { Web3Provider } from "@ethersproject/providers";

export const getLibrary = (provider) => {
  const library = new Web3Provider(provider);
  return library;
}

export const ETHEREUM_NETWORK_ID = 1;
export const SEPOLIA_NETWORK_ID = 11155111;
export const LOCAL_NETWORK_ID = 31337;
export const injectedConnector = new InjectedConnector({ supportedChainIds: 
    [ETHEREUM_NETWORK_ID, SEPOLIA_NETWORK_ID, LOCAL_NETWORK_ID] });     