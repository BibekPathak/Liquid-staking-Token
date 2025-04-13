"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNativeTokens = exports.burnTokens = exports.mintTokens = void 0;
const web3_js_1 = require("@solana/web3.js");
const address_1 = require("./address");
const TokenProgram = __importStar(require("@solana/spl-token"));
const bs58_1 = __importDefault(require("bs58"));
const mintTokens = (fromAddress, toAddress, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const secret = new Uint8Array(address_1.PRIVATE_KEY);
    const wallet = web3_js_1.Keypair.fromSecretKey(secret);
    const mint = new web3_js_1.PublicKey(address_1.TOKEN_MINT_ADDRESS);
    const tokenAccount = yield TokenProgram.getOrCreateAssociatedTokenAccount(getConnection(), wallet, mint, wallet.publicKey);
    yield TokenProgram.mintTo(getConnection(), wallet, tokenAccount.mint, tokenAccount.address, wallet.publicKey, amount);
});
exports.mintTokens = mintTokens;
const burnTokens = (amount) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Burning token");
    const secret = new Uint8Array(bs58_1.default.decode(address_1.PRIVATE_KEY));
    const payer = web3_js_1.Keypair.fromSecretKey(secret);
    const mint = new web3_js_1.PublicKey(address_1.TOKEN_MINT_ADDRESS);
    const connection = getConnection();
    const tokenAccount = yield TokenProgram.getOrCreateAssociatedTokenAccount(connection, payer, mint, payer.publicKey);
    yield TokenProgram.burn(connection, payer, tokenAccount.address, mint, payer.publicKey, amount);
});
exports.burnTokens = burnTokens;
const sendNativeTokens = (fromAddress, toAddress, amount) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Sending native token");
    const connection = getConnection();
    const latestBlockHash = yield connection.getLatestBlockhash();
    const secret = new Uint8Array(bs58_1.default.decode(address_1.PRIVATE_KEY));
    const payer = web3_js_1.Keypair.fromSecretKey(secret);
    const recipientPublicKey = new web3_js_1.PublicKey(toAddress);
    const transfer = web3_js_1.SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: recipientPublicKey,
        lamports: amount,
    });
    const transaction = new web3_js_1.Transaction();
    transaction.add(transfer);
    transaction.recentBlockhash = latestBlockHash.blockhash;
    transaction.lastValidBlockHeight = latestBlockHash.lastValidBlockHeight;
    const signature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [
        payer,
    ]);
    yield connection.confirmTransaction({
        signature,
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    });
    return signature;
});
exports.sendNativeTokens = sendNativeTokens;
function getConnection() {
    return new web3_js_1.Connection("https://api.devnet.solana.com");
}
