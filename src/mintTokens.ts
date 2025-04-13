import {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
  } from "@solana/web3.js";
  import { PRIVATE_KEY, TOKEN_MINT_ADDRESS } from "./address";
  import * as TokenProgram from "@solana/spl-token";
  import bs58 from "bs58";


export const mintTokens = async (fromAddress: string, toAddress: string, amount: number) => {
    const secret = new Uint8Array(PRIVATE_KEY as any);
    const wallet = Keypair.fromSecretKey(secret);
    const mint = new PublicKey(TOKEN_MINT_ADDRESS);

    const tokenAccount = await TokenProgram.getOrCreateAssociatedTokenAccount(
        getConnection(),
        wallet,
        mint,
        wallet.publicKey
    );

    await TokenProgram.mintTo(
        getConnection(),
        wallet,
        tokenAccount.mint,
        tokenAccount.address,
        wallet.publicKey,
        amount
    );
}

export const burnTokens = async (amount: number) => {
    console.log("Burning token");
    const secret = new Uint8Array(bs58.decode(PRIVATE_KEY));
    const payer = Keypair.fromSecretKey(secret);
    const mint = new PublicKey(TOKEN_MINT_ADDRESS);
  
    const connection = getConnection();
  
    const tokenAccount = await TokenProgram.getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
    );
    await TokenProgram.burn(
      connection,
      payer,
      tokenAccount.address,
      mint,
      payer.publicKey,
      amount
    );
  };

  export const sendNativeTokens = async (fromAddress: string, toAddress: string, amount: number) => {
    console.log("Sending native token");
    const connection = getConnection();
    const latestBlockHash = await connection.getLatestBlockhash();
  
    const secret = new Uint8Array(bs58.decode(PRIVATE_KEY));
    const payer = Keypair.fromSecretKey(secret);
  
    const recipientPublicKey = new PublicKey(toAddress);
  
    const transfer = SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: recipientPublicKey,
      lamports: amount,
    });
    const transaction = new Transaction();
    transaction.add(transfer);
  
    transaction.recentBlockhash = latestBlockHash.blockhash;
    transaction.lastValidBlockHeight = latestBlockHash.lastValidBlockHeight;
  
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      payer,
    ]);
  
    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    });
    return signature;
};


function getConnection(): Connection {
    return new Connection("https://api.devnet.solana.com");
  }