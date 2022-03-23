import { Gas } from "near-units";
import { readFile } from "fs/promises";
import { Context } from "near-cli/context";
import { Contract } from "../nft/dist";
import { valid_account_id } from "./utils";

const gas = Gas.parse("200 Tgas")

async function hasToken(
    contract: Contract,
    account_id: string,
    token_num: string,
): Promise<boolean> {
    try {
        let tokens = await contract.nft_tokens_for_owner({ account_id });
        return tokens.some(token => token.metadata!.media == `${token_num}.png`);
    } catch (e) {
        console.log(e);
        console.log(`Problem with ${account_id}`);
        return true;
    }
}

async function mint(contract: Contract, account_id: string, token_num: string) {
    if (token_num == "1") {
        return contract.nft_mint_one({ token_owner_id: account_id }, {gas});
    } else {
        return contract.nft_mint_two({ token_owner_id: account_id }, {gas});
    }
}

const DEFAULT_PER_TX = 200;

export async function main({ account, argv }: Context) {
    if (argv.length < 3) {
        console.error(
            `Help:\n<input file> <contractId> <token_num> <amount per tx? (default ${DEFAULT_PER_TX})>`
        );
        process.exit(1);
    }
    const [file, contractId, token_num, number] = argv;
    let accounts = filter_accounts(JSON.parse(await readFile(file, "utf8")));

    const allowance = parseInt(token_num);
    let atATime = number ? parseInt(number) : DEFAULT_PER_TX;
    const contract = new Contract(account, contractId);

    for (let i = 0; i < accounts.length; i = i + 1) {
        let account_id = accounts[i];
        if (await hasToken(contract, account_id, token_num)) {
            continue;
        }
        try {
            await mint(contract, account_id, token_num);
        } catch (e) {
            console.log(`Failed ${account_id}`);
            continue;
        }
        console.log(`Added ${account_id}`);
    }
}

function filter_accounts(raw_account_ids: string[]): string[] {
    const account_ids = raw_account_ids.map(s => s.trim().toLowerCase());
    let invalid_account_ids = account_ids.filter(
        (id) => !valid_account_id.test(id)
    );
    if (invalid_account_ids.length > 0) {
        console.log(`invalid Ids "${invalid_account_ids}"`);
    }
    return account_ids.filter((id) => valid_account_id.test(id));
}
