"use strict";
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
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const mintTokens_1 = require("./mintTokens");
const address_1 = require("./address");
// database
const processedTransfers = {};
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post('/helius', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                const { amount, fromUserAccount, toUserAccount } = data.nativeTransfers[0];
                if (toUserAccount === address_1.PUBLIC_KEY) {
                    yield (0, mintTokens_1.mintTokens)(fromUserAccount, toUserAccount, amount);
                }
            }
            else if (data.tokenTransfers.length > 0) {
                const { fromUserAccount, mint, toUserAccount, tokenAmount } = data.tokenTransfers[0];
                console.log({ tokenAmount });
                if (mint === address_1.TOKEN_MINT_ADDRESS && toUserAccount === address_1.PUBLIC_KEY) {
                    const amount = parseFloat(tokenAmount) * 10 ** address_1.TOKEN_MINT_DECIMALS;
                    yield (0, mintTokens_1.sendNativeTokens)(fromUserAccount, toUserAccount, amount);
                    yield (0, mintTokens_1.burnTokens)(amount);
                    processedTransfers[data.signature] = true;
                }
            }
        }
    }
    catch (error) {
        console.log(error);
    }
    res.send("Success");
}));
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
