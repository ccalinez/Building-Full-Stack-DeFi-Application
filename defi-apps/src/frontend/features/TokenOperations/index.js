import { Button, Divider, Grid, Typography, useTheme, TextField } from '@mui/material';
import {useState, useEffect, useCallback } from 'react';
import { Contract, formatUnits, isAddress, parseUnits } from 'ethers';
import Token from '../../contracts/SimpleDeFiToken.json';
import { useWeb3React } from '@web3-react/core';
import { localProvider } from '../../components/Wallet';
import {toast} from 'react-toastify';

const TokenOperations = () => {
  const theme = useTheme();

  const [totalSupply, setTotalSupply] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [addressNormal, setAddressNormal] = useState('');
  const [amountNormal, setAmountNormal] = useState(0);
  const [addressBurn, setAddressBurn] = useState('');
  const [amountBurn, setAmountBurn] = useState(0);
  

  const { account, active, library } = useWeb3React();

  const getTotalSupply = useCallback(async() => {
    try {
      console.log(`Direccion contrato ${Token.address}`);
      console.log('Provider network:', await localProvider.getNetwork());
      console.log(`ABI ${JSON.stringify(Token.abi)}`);
      

      const contract = new Contract(Token.address, Token.abi, localProvider);
      const response = await contract.totalSupply();
      setTotalSupply(formatUnits(response, 18));
    }
    catch(err) {
      console.error(err);
    }
  }, []);

  const getUserBalance = useCallback(async () => {
    try {
      if(!active) return;
      console.log(`Direccion contrato ${Token.address}`);
      console.log(`ABI ${JSON.stringify(Token.abi)}`);
      console.log('Signer network:', await library.getNetwork());
      const contract = new Contract(Token.address, Token.abi, library.getSigner(account));
      const response = await contract.balanceOf(account);
      setUserBalance(formatUnits(response, 18));
     } catch(err) {
      console.error(err); 
    }
  }, [account, library, active]);

  const handleTransfer = async(autoBurn) => {
    if(!active){
      toast.error('You have to connect to wallet first before transfer!');
      return;
    }
    const type = autoBurn ? 'auto burn' : 'normal';
    const address = autoBurn ? addressBurn : addressNormal;
    const amount = autoBurn ? amountBurn : amountNormal; 
    if(!isAddress(address)){
      toast.error(`The recipient address for ${type} transfer is not valid!`);
      return;
    }
    if(isNaN(amount)){
      toast.error(`The amount for ${type} transfer is not valid!`);
      return;
    }
    try {
      const contract = new Contract(Token.address, Token.abi, library.getSigner(account));
      const tx =  autoBurn ? await contract.transferWithAutoBurn(address, parseUnits(amount, 'ether')) 
        : await contract.transfer(address, parseUnits(amount, 'ether'));
      toast.info(`Transaction Submitted TxHash ${tx.hash}`);
      await tx.wait();
      toast.success(`Transaction Succeeded! TxHash ${tx.hash}`);
      if(autoBurn){
        setAddressBurn('');
        setAmountBurn(0); 
       } else {
        setAddressNormal('');
        setAmountNormal(0); 
       }
       getUserBalance();
       getTotalSupply();  
    }catch(err){
      console.error(err);
      toast.error(`There was an error trying to execute the ${type} transfer!`);
    }

  }

  useEffect(() => {
    getUserBalance();
    getTotalSupply();
  },[getTotalSupply, getUserBalance]);

  return <>
    <Grid container spacing={2}>
      <Grid item xs={12}><Typography variant='h6'>Simple DeFi Token</Typography></Grid>
      <Grid item xs={6}>
        <Typography variant='h6'>Total Supply</Typography>
        <Typography>{totalSupply}</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant='h6'>Your Balance</Typography>
        <Typography>{userBalance}</Typography>
      </Grid>
    </Grid>
    <Divider sx={theme.component.divider} />
    <Grid container spacing={2}>
      <Grid item xs={12}><Typography variant='h6'>Normal Transfer</Typography></Grid>
      <Grid item xs={12}>
        <TextField label="Please Enter Recipient's Address" value={addressNormal} fullWidth onChange={e=> setAddressNormal(e.target.value)} />
      </Grid>
      <Grid item xs={12}>
        <TextField label="Please Enter Amount to transfer" value={amountNormal} fullWidth onChange={ e=> setAmountNormal(e.target.value)} />
      </Grid>
      <Grid item xs={12}>
        <Button sx={theme.component.primaryButton} fullWidth  onClick={() => handleTransfer(false)}>Transfer!</Button>
      </Grid>
    </Grid>
    <Divider sx={theme.component.divider} />
    <Grid container spacing={2}>
      <Grid item xs={12}><Typography variant='h6'>Transfer with Burn</Typography></Grid>
      <Grid item xs={12}>
        <TextField label="Please Enter Recipient's Address" value={addressBurn} fullWidth  onChange={e=> setAddressBurn(e.target.value)}/>
      </Grid>
      <Grid item xs={12}>
        <TextField label="Please Enter Amount to transfer (10% of tokens will be burnt automatically)" value={amountBurn} fullWidth onChange={e => setAmountBurn(e.target.value)} />
      </Grid>
      <Grid item xs={12}>
        <Button sx={theme.component.primaryButton} fullWidth onClick={() => handleTransfer(true)}>Transfer with Burn!</Button>
      </Grid>
    </Grid>
  </>;
};

export default TokenOperations;