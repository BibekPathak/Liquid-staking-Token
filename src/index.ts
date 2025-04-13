require('dotenv').config();
import express from 'express';
import { burnTokens, mintTokens, sendNativeTokens } from './mintTokens';
import { PUBLIC_KEY, TOKEN_MINT_ADDRESS, TOKEN_MINT_DECIMALS } from "./address";

// database
const processedTransfers: { [key: string]: boolean } = {};

const app = express();

app.use(express.json());


app.post('/helius', async(req, res) => {
    // const fromAddress = req.body.fromAddress;
    // const toAddress = req.body.toAddress;
    // const amount = req.body.amount;
    // const type = "received_native_sol";

    // if (type === "received_native_sol") {
    //     await mintTokens(fromAddress, toAddress, amount);
    // } else {
    //     // What could go wrong here?
    //     await burnTokens(fromAddress, toAddress, amount);
    //     await sendNativeTokens(fromAddress, toAddress, amount);
    // }

    // res.send('Transaction successful');

    try {
        const data = req.body[0];
        if (processedTransfers[data.signature]) {
          res.send("Success");
          return;
        }
    
        // I wanted to verify the signature as well but this webhook gets called very fast and the verification will
        // fail for valid signature as well
    
        if (data.type === "TRANSFER") {
          if (data.nativeTransfers.length > 0) {
            const { amount, fromUserAccount, toUserAccount } =
              data.nativeTransfers[0];
    
            if (toUserAccount === PUBLIC_KEY) {
              await mintTokens(fromUserAccount, toUserAccount, amount);
            }
          } else if (data.tokenTransfers.length > 0) {
            const { fromUserAccount, mint, toUserAccount, tokenAmount } =
              data.tokenTransfers[0];
            console.log({ tokenAmount });
            if (mint === TOKEN_MINT_ADDRESS && toUserAccount === PUBLIC_KEY) {
              const amount = parseFloat(tokenAmount) * 10 ** TOKEN_MINT_DECIMALS;
              await sendNativeTokens(fromUserAccount,toUserAccount, amount);
              await burnTokens(amount);
              processedTransfers[data.signature] = true;
            }
          }
        }
    }
    catch (error) {
        console.log(error);
    }
    res.send("Success");
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});