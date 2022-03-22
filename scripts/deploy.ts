import { NEAR, Gas } from "near-units";
import { readFile } from "fs/promises";
import { Context } from "near-cli/context";
import * as nft from "../nft/dist";
import { binPath } from "./utils";
import {icon} from "./icon";

const metadata: nft.InitialMetadata = {
  uri: "https://bafybeidf5lepzvbtgoo2qrpzkqj5deukuaqxua4u5m5nfy2cryomlrqrwu.ipfs.dweb.link/",
  name: "MR. BROWN SPECIAL",
  symbol: "MRBRNSPL",
  icon
};



export async function main({ account, nearAPI, argv, near }: Context) {
  let { Account } = nearAPI;
  const contractBytes = await readFile(binPath("non_fungible_token"));
  if (!account) {
    throw new Error("Must provide --accountId")
  }

  let [contractId] = argv ?? [];
  contractId = contractId ?? account.accountId;
  let contractAccount = new Account(near.connection, contractId);

  const isTestnet = contractId.endsWith("testnet");

  const initialArgs = {
    owner_id: account.accountId,
    metadata,
  };

  const contract = new nft.Contract(account, contractId);

  const tx = account
    .createTransaction(contractId)
    .deployContract(contractBytes);

  if (await contractAccount.hasDeployedContract()) {
    console.log(`initializing with: \n${JSON.stringify(initialArgs, null, 2)}`);
    tx.actions.push(
      contract.newTx(initialArgs, { gas: Gas.parse("50Tgas") })
    );
  }
  let res = await tx.signAndSend();
  console.log(
    `https://explorer${isTestnet ? ".testnet" : ""}.near.org/transactions/${
      res.transaction_outcome.id
    }`
  );
  //@ts-ignore
  if (res.status.SuccessValue) {
    console.log(`deployed ${contractId}`);
  } else {
    console.log(res);
  }
}
