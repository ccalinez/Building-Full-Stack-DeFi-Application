import { Button, Divider, Grid, Typography, useTheme, TextField } from '@mui/material';
import {useState, useEffect, useCallback } from 'react';
import { Contract, formatUnits } from 'ethers';
import Token from '../../contracts/SimpleDeFiToken.json';
import { useWeb3React } from '@web3-react/core';
import { localProvider } from '../../components/Wallet';  

const TokenOperations = () => {
  const theme = useTheme();

  const [totalSupply, setTotalSupply] = useState(0);
  const [userBalance, setUserBalance] = useState(0);

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
        <TextField label="Please Enter Recipient's Address" value={""} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <TextField label="Please Enter Amount to transfer" value={""} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <Button sx={theme.component.primaryButton} fullWidth>Transfer!</Button>
      </Grid>
    </Grid>
    <Divider sx={theme.component.divider} />
    <Grid container spacing={2}>
      <Grid item xs={12}><Typography variant='h6'>Transfer with Burn</Typography></Grid>
      <Grid item xs={12}>
        <TextField label="Please Enter Recipient's Address" value={""} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <TextField label="Please Enter Amount to transfer (10% of tokens will be burnt automatically)" value={""} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <Button sx={theme.component.primaryButton} fullWidth>Transfer with Burn!</Button>
      </Grid>
    </Grid>
  </>;
};

export default TokenOperations;