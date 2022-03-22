import {
  Account,
  transactions,
  providers,
  DEFAULT_FUNCTION_CALL_GAS,
  u8,
  i8,
  u16,
  i16,
  u32,
  i32,
  u64,
  i64,
  f32,
  f64,
  BN,
  ChangeMethodOptions,
  ViewFunctionOptions,
} from './helper';

/**
* StorageUsage is used to count the amount of storage used by a contract.
*/
export type StorageUsage = u64;
/**
* Balance is a type for storing amounts of tokens, specified in yoctoNEAR.
*/
export type Balance = U128;
/**
* Represents the amount of NEAR tokens in "gas units" which are used to fund transactions.
*/
export type Gas = u64;
/**
* base64 string.
*/
export type Base64VecU8 = string;
/**
* Raw type for duration in nanoseconds
*/
export type Duration = u64;
/**
* @minLength 2
* @maxLength 64
* @pattern ^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$
*/
export type AccountId = string;
/**
* String representation of a u128-bit integer
* @pattern ^[0-9]+$
*/
export type U128 = string;
/**
* Public key in a binary format with base58 string serialization with human-readable curve.
* The key types currently supported are `secp256k1` and `ed25519`.
* 
* Ed25519 public keys accepted are 32 bytes and secp256k1 keys are the uncompressed 64 format.
*/
export type PublicKey = string;
/**
* Raw type for timestamp in nanoseconds
*/
export type Timestamp = u64;
/**
* In this implementation, the Token struct takes two extensions standards (metadata and approval) as optional fields, as they are frequently used in modern NFTs.
*/
export interface Token {
  token_id: TokenId;
  owner_id: AccountId;
  metadata?: TokenMetadata;
  approved_account_ids?: Record<AccountId, u64>;
}
export interface FungibleTokenMetadata {
  spec: string;
  name: string;
  symbol: string;
  icon?: string;
  reference?: string;
  reference_hash?: Base64VecU8;
  decimals: u8;
}
/**
* Note that token IDs for NFTs are strings on NEAR. It's still fine to use autoincrementing numbers as unique IDs if desired, but they should be stringified. This is to make IDs more future-proof as chain-agnostic conventions and standards arise, and allows for more flexibility with considerations like bridging NFTs across chains, etc.
*/
export type TokenId = string;
/**
* Metadata for the NFT contract itself.
*/
export interface NftContractMetadata {
  spec: string;
  name: string;
  symbol: string;
  icon?: string;
  base_uri?: string;
  reference?: string;
  reference_hash?: Base64VecU8;
}
export interface StorageBalanceBounds {
  min: U128;
  max?: U128;
}
/**
* Metadata on the individual token level.
*/
export interface TokenMetadata {
  title?: string;
  description?: string;
  media?: string;
  media_hash?: Base64VecU8;
  copies?: u64;
  issued_at?: string;
  expires_at?: string;
  starts_at?: string;
  updated_at?: string;
  extra?: string;
  reference?: string;
  reference_hash?: Base64VecU8;
}
export interface StorageBalance {
  total: U128;
  available: U128;
}
export type WrappedDuration = string;
export interface InitialMetadata {
  name: string;
  symbol: string;
  uri: string;
  icon?: string;
  spec?: string;
  reference?: string;
  reference_hash?: Base64VecU8;
}

export class Contract {
  
  constructor(public account: Account, public readonly contractId: string){}
  
  /**
  * Revoke all approved accounts for a specific token.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
  * purposes
  * * If contract requires >1yN deposit on `nft_approve`, contract
  * MUST refund all associated storage deposit when owner revokes approvals
  * * Contract MUST panic if called by someone other than token owner
  * 
  * Arguments:
  * * `token_id`: the token with approvals to revoke
  */
  async nft_revoke_all(args: {
    token_id: TokenId;
  }, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.nft_revoke_allRaw(args, options));
  }
  /**
  * Revoke all approved accounts for a specific token.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
  * purposes
  * * If contract requires >1yN deposit on `nft_approve`, contract
  * MUST refund all associated storage deposit when owner revokes approvals
  * * Contract MUST panic if called by someone other than token owner
  * 
  * Arguments:
  * * `token_id`: the token with approvals to revoke
  */
  nft_revoke_allRaw(args: {
    token_id: TokenId;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_revoke_all", args, ...options});
  }
  /**
  * Revoke all approved accounts for a specific token.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
  * purposes
  * * If contract requires >1yN deposit on `nft_approve`, contract
  * MUST refund all associated storage deposit when owner revokes approvals
  * * Contract MUST panic if called by someone other than token owner
  * 
  * Arguments:
  * * `token_id`: the token with approvals to revoke
  */
  nft_revoke_allTx(args: {
    token_id: TokenId;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("nft_revoke_all", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Simple transfer. Transfer a given `token_id` from current owner to
  * `receiver_id`.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security purposes
  * * Contract MUST panic if called by someone other than token owner or,
  * if using Approval Management, one of the approved accounts
  * * `approval_id` is for use with Approval Management,
  * see <https://nomicon.io/Standards/NonFungibleToken/ApprovalManagement.html>
  * * If using Approval Management, contract MUST nullify approved accounts on
  * successful transfer.
  * * TODO: needed? Both accounts must be registered with the contract for transfer to
  * succeed. See see <https://nomicon.io/Standards/StorageManagement.html>
  * 
  * Arguments:
  * * `receiver_id`: the valid NEAR account receiving the token
  * * `token_id`: the token to transfer
  * * `approval_id`: expected approval ID. A number smaller than
  * 2^53, and therefore representable as JSON. See Approval Management
  * standard for full explanation.
  * * `memo` (optional): for use cases that may benefit from indexing or
  * providing information for a transfer
  */
  async nft_transfer(args: {
    receiver_id: AccountId;
    token_id: TokenId;
    approval_id?: u64;
    memo?: string;
  }, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.nft_transferRaw(args, options));
  }
  /**
  * Simple transfer. Transfer a given `token_id` from current owner to
  * `receiver_id`.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security purposes
  * * Contract MUST panic if called by someone other than token owner or,
  * if using Approval Management, one of the approved accounts
  * * `approval_id` is for use with Approval Management,
  * see <https://nomicon.io/Standards/NonFungibleToken/ApprovalManagement.html>
  * * If using Approval Management, contract MUST nullify approved accounts on
  * successful transfer.
  * * TODO: needed? Both accounts must be registered with the contract for transfer to
  * succeed. See see <https://nomicon.io/Standards/StorageManagement.html>
  * 
  * Arguments:
  * * `receiver_id`: the valid NEAR account receiving the token
  * * `token_id`: the token to transfer
  * * `approval_id`: expected approval ID. A number smaller than
  * 2^53, and therefore representable as JSON. See Approval Management
  * standard for full explanation.
  * * `memo` (optional): for use cases that may benefit from indexing or
  * providing information for a transfer
  */
  nft_transferRaw(args: {
    receiver_id: AccountId;
    token_id: TokenId;
    approval_id?: u64;
    memo?: string;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_transfer", args, ...options});
  }
  /**
  * Simple transfer. Transfer a given `token_id` from current owner to
  * `receiver_id`.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security purposes
  * * Contract MUST panic if called by someone other than token owner or,
  * if using Approval Management, one of the approved accounts
  * * `approval_id` is for use with Approval Management,
  * see <https://nomicon.io/Standards/NonFungibleToken/ApprovalManagement.html>
  * * If using Approval Management, contract MUST nullify approved accounts on
  * successful transfer.
  * * TODO: needed? Both accounts must be registered with the contract for transfer to
  * succeed. See see <https://nomicon.io/Standards/StorageManagement.html>
  * 
  * Arguments:
  * * `receiver_id`: the valid NEAR account receiving the token
  * * `token_id`: the token to transfer
  * * `approval_id`: expected approval ID. A number smaller than
  * 2^53, and therefore representable as JSON. See Approval Management
  * standard for full explanation.
  * * `memo` (optional): for use cases that may benefit from indexing or
  * providing information for a transfer
  */
  nft_transferTx(args: {
    receiver_id: AccountId;
    token_id: TokenId;
    approval_id?: u64;
    memo?: string;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("nft_transfer", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Check if a token is approved for transfer by a given account, optionally
  * checking an approval_id
  * 
  * Arguments:
  * * `token_id`: the token for which to revoke an approval
  * * `approved_account_id`: the account to check the existence of in `approvals`
  * * `approval_id`: an optional approval ID to check against current approval ID for given account
  * 
  * Returns:
  * if `approval_id` given, `true` if `approved_account_id` is approved with given `approval_id`
  * otherwise, `true` if `approved_account_id` is in list of approved accounts
  */
  nft_is_approved(args: {
    token_id: TokenId;
    approved_account_id: AccountId;
    approval_id?: u64;
  }, options?: ViewFunctionOptions): Promise<boolean> {
    return this.account.viewFunction(this.contractId, "nft_is_approved", args, options);
  }
  /**
  * Get a list of all tokens
  * 
  * Arguments:
  * * `from_index`: a string representing an unsigned 128-bit integer,
  * representing the starting index of tokens to return. (default 0)
  * * `limit`: the maximum number of tokens to return (default total supply)
  * Could fail on gas
  * 
  * Returns an array of Token objects, as described in Core standard
  */
  nft_tokens(args: {
    from_index?: U128;
    limit?: u64;
  }, options?: ViewFunctionOptions): Promise<Token[]> {
    return this.account.viewFunction(this.contractId, "nft_tokens", args, options);
  }
  /**
  * Transfer token and call a method on a receiver contract. A successful
  * workflow will end in a success execution outcome to the callback on the NFT
  * contract at the method `nft_resolve_transfer`.
  * 
  * You can think of this as being similar to attaching native NEAR tokens to a
  * function call. It allows you to attach any Non-Fungible Token in a call to a
  * receiver contract.
  * 
  * Requirements:
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
  * purposes
  * * Contract MUST panic if called by someone other than token owner or,
  * if using Approval Management, one of the approved accounts
  * * The receiving contract must implement `ft_on_transfer` according to the
  * standard. If it does not, FT contract's `ft_resolve_transfer` MUST deal
  * with the resulting failed cross-contract call and roll back the transfer.
  * * Contract MUST implement the behavior described in `ft_resolve_transfer`
  * * `approval_id` is for use with Approval Management extension, see
  * that document for full explanation.
  * * If using Approval Management, contract MUST nullify approved accounts on
  * successful transfer.
  * 
  * Arguments:
  * * `receiver_id`: the valid NEAR account receiving the token.
  * * `token_id`: the token to send.
  * * `approval_id`: expected approval ID. A number smaller than
  * 2^53, and therefore representable as JSON. See Approval Management
  * standard for full explanation.
  * * `memo` (optional): for use cases that may benefit from indexing or
  * providing information for a transfer.
  * * `msg`: specifies information needed by the receiving contract in
  * order to properly handle the transfer. Can indicate both a function to
  * call and the parameters to pass to that function.
  */
  async nft_transfer_call(args: {
    receiver_id: AccountId;
    token_id: TokenId;
    approval_id?: u64;
    memo?: string;
    msg: string;
  }, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.nft_transfer_callRaw(args, options));
  }
  /**
  * Transfer token and call a method on a receiver contract. A successful
  * workflow will end in a success execution outcome to the callback on the NFT
  * contract at the method `nft_resolve_transfer`.
  * 
  * You can think of this as being similar to attaching native NEAR tokens to a
  * function call. It allows you to attach any Non-Fungible Token in a call to a
  * receiver contract.
  * 
  * Requirements:
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
  * purposes
  * * Contract MUST panic if called by someone other than token owner or,
  * if using Approval Management, one of the approved accounts
  * * The receiving contract must implement `ft_on_transfer` according to the
  * standard. If it does not, FT contract's `ft_resolve_transfer` MUST deal
  * with the resulting failed cross-contract call and roll back the transfer.
  * * Contract MUST implement the behavior described in `ft_resolve_transfer`
  * * `approval_id` is for use with Approval Management extension, see
  * that document for full explanation.
  * * If using Approval Management, contract MUST nullify approved accounts on
  * successful transfer.
  * 
  * Arguments:
  * * `receiver_id`: the valid NEAR account receiving the token.
  * * `token_id`: the token to send.
  * * `approval_id`: expected approval ID. A number smaller than
  * 2^53, and therefore representable as JSON. See Approval Management
  * standard for full explanation.
  * * `memo` (optional): for use cases that may benefit from indexing or
  * providing information for a transfer.
  * * `msg`: specifies information needed by the receiving contract in
  * order to properly handle the transfer. Can indicate both a function to
  * call and the parameters to pass to that function.
  */
  nft_transfer_callRaw(args: {
    receiver_id: AccountId;
    token_id: TokenId;
    approval_id?: u64;
    memo?: string;
    msg: string;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_transfer_call", args, ...options});
  }
  /**
  * Transfer token and call a method on a receiver contract. A successful
  * workflow will end in a success execution outcome to the callback on the NFT
  * contract at the method `nft_resolve_transfer`.
  * 
  * You can think of this as being similar to attaching native NEAR tokens to a
  * function call. It allows you to attach any Non-Fungible Token in a call to a
  * receiver contract.
  * 
  * Requirements:
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
  * purposes
  * * Contract MUST panic if called by someone other than token owner or,
  * if using Approval Management, one of the approved accounts
  * * The receiving contract must implement `ft_on_transfer` according to the
  * standard. If it does not, FT contract's `ft_resolve_transfer` MUST deal
  * with the resulting failed cross-contract call and roll back the transfer.
  * * Contract MUST implement the behavior described in `ft_resolve_transfer`
  * * `approval_id` is for use with Approval Management extension, see
  * that document for full explanation.
  * * If using Approval Management, contract MUST nullify approved accounts on
  * successful transfer.
  * 
  * Arguments:
  * * `receiver_id`: the valid NEAR account receiving the token.
  * * `token_id`: the token to send.
  * * `approval_id`: expected approval ID. A number smaller than
  * 2^53, and therefore representable as JSON. See Approval Management
  * standard for full explanation.
  * * `memo` (optional): for use cases that may benefit from indexing or
  * providing information for a transfer.
  * * `msg`: specifies information needed by the receiving contract in
  * order to properly handle the transfer. Can indicate both a function to
  * call and the parameters to pass to that function.
  */
  nft_transfer_callTx(args: {
    receiver_id: AccountId;
    token_id: TokenId;
    approval_id?: u64;
    memo?: string;
    msg: string;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("nft_transfer_call", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Initializes the contract owned by `owner_id` with
  * default metadata (for example purposes only).
  */
  async new_default_meta(args: {
    owner_id: AccountId;
  }, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.new_default_metaRaw(args, options));
  }
  /**
  * Initializes the contract owned by `owner_id` with
  * default metadata (for example purposes only).
  */
  new_default_metaRaw(args: {
    owner_id: AccountId;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "new_default_meta", args, ...options});
  }
  /**
  * Initializes the contract owned by `owner_id` with
  * default metadata (for example purposes only).
  */
  new_default_metaTx(args: {
    owner_id: AccountId;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("new_default_meta", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Revoke an approved account for a specific token.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
  * purposes
  * * If contract requires >1yN deposit on `nft_approve`, contract
  * MUST refund associated storage deposit when owner revokes approval
  * * Contract MUST panic if called by someone other than token owner
  * 
  * Arguments:
  * * `token_id`: the token for which to revoke an approval
  * * `account_id`: the account to remove from `approvals`
  */
  async nft_revoke(args: {
    token_id: TokenId;
    account_id: AccountId;
  }, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.nft_revokeRaw(args, options));
  }
  /**
  * Revoke an approved account for a specific token.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
  * purposes
  * * If contract requires >1yN deposit on `nft_approve`, contract
  * MUST refund associated storage deposit when owner revokes approval
  * * Contract MUST panic if called by someone other than token owner
  * 
  * Arguments:
  * * `token_id`: the token for which to revoke an approval
  * * `account_id`: the account to remove from `approvals`
  */
  nft_revokeRaw(args: {
    token_id: TokenId;
    account_id: AccountId;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_revoke", args, ...options});
  }
  /**
  * Revoke an approved account for a specific token.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
  * purposes
  * * If contract requires >1yN deposit on `nft_approve`, contract
  * MUST refund associated storage deposit when owner revokes approval
  * * Contract MUST panic if called by someone other than token owner
  * 
  * Arguments:
  * * `token_id`: the token for which to revoke an approval
  * * `account_id`: the account to remove from `approvals`
  */
  nft_revokeTx(args: {
    token_id: TokenId;
    account_id: AccountId;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("nft_revoke", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Returns the token with the given `token_id` or `null` if no such token.
  */
  nft_token(args: {
    token_id: TokenId;
  }, options?: ViewFunctionOptions): Promise<Token | null> {
    return this.account.viewFunction(this.contractId, "nft_token", args, options);
  }
  async new(args: {
    owner_id: AccountId;
    metadata: InitialMetadata;
  }, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.newRaw(args, options));
  }
  newRaw(args: {
    owner_id: AccountId;
    metadata: InitialMetadata;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "new", args, ...options});
  }
  newTx(args: {
    owner_id: AccountId;
    metadata: InitialMetadata;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("new", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Returns the total supply of non-fungible tokens as a string representing an
  * unsigned 128-bit integer to avoid JSON number limit of 2^53.
  */
  nft_total_supply(args = {}, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "nft_total_supply", args, options);
  }
  /**
  * Add an approved account for a specific token.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of at least 1 yoctoⓃ for
  * security purposes
  * * Contract MAY require caller to attach larger deposit, to cover cost of
  * storing approver data
  * * Contract MUST panic if called by someone other than token owner
  * * Contract MUST panic if addition would cause `nft_revoke_all` to exceed
  * single-block gas limit
  * * Contract MUST increment approval ID even if re-approving an account
  * * If successfully approved or if had already been approved, and if `msg` is
  * present, contract MUST call `nft_on_approve` on `account_id`. See
  * `nft_on_approve` description below for details.
  * 
  * Arguments:
  * * `token_id`: the token for which to add an approval
  * * `account_id`: the account to add to `approvals`
  * * `msg`: optional string to be passed to `nft_on_approve`
  * 
  * Returns void, if no `msg` given. Otherwise, returns promise call to
  * `nft_on_approve`, which can resolve with whatever it wants.
  */
  async nft_approve(args: {
    token_id: TokenId;
    account_id: AccountId;
    msg?: string;
  }, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.nft_approveRaw(args, options));
  }
  /**
  * Add an approved account for a specific token.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of at least 1 yoctoⓃ for
  * security purposes
  * * Contract MAY require caller to attach larger deposit, to cover cost of
  * storing approver data
  * * Contract MUST panic if called by someone other than token owner
  * * Contract MUST panic if addition would cause `nft_revoke_all` to exceed
  * single-block gas limit
  * * Contract MUST increment approval ID even if re-approving an account
  * * If successfully approved or if had already been approved, and if `msg` is
  * present, contract MUST call `nft_on_approve` on `account_id`. See
  * `nft_on_approve` description below for details.
  * 
  * Arguments:
  * * `token_id`: the token for which to add an approval
  * * `account_id`: the account to add to `approvals`
  * * `msg`: optional string to be passed to `nft_on_approve`
  * 
  * Returns void, if no `msg` given. Otherwise, returns promise call to
  * `nft_on_approve`, which can resolve with whatever it wants.
  */
  nft_approveRaw(args: {
    token_id: TokenId;
    account_id: AccountId;
    msg?: string;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_approve", args, ...options});
  }
  /**
  * Add an approved account for a specific token.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of at least 1 yoctoⓃ for
  * security purposes
  * * Contract MAY require caller to attach larger deposit, to cover cost of
  * storing approver data
  * * Contract MUST panic if called by someone other than token owner
  * * Contract MUST panic if addition would cause `nft_revoke_all` to exceed
  * single-block gas limit
  * * Contract MUST increment approval ID even if re-approving an account
  * * If successfully approved or if had already been approved, and if `msg` is
  * present, contract MUST call `nft_on_approve` on `account_id`. See
  * `nft_on_approve` description below for details.
  * 
  * Arguments:
  * * `token_id`: the token for which to add an approval
  * * `account_id`: the account to add to `approvals`
  * * `msg`: optional string to be passed to `nft_on_approve`
  * 
  * Returns void, if no `msg` given. Otherwise, returns promise call to
  * `nft_on_approve`, which can resolve with whatever it wants.
  */
  nft_approveTx(args: {
    token_id: TokenId;
    account_id: AccountId;
    msg?: string;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("nft_approve", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Mint a new token with ID=`token_id` belonging to `token_owner_id`.
  * 
  * Since this example implements metadata, it also requires per-token metadata to be provided
  * in this call. `self.tokens.mint` will also require it to be Some, since
  * `StorageKey::TokenMetadata` was provided at initialization.
  * 
  * `self.tokens.mint` will enforce `predecessor_account_id` to equal the `owner_id` given in
  * initialization call to `new`.
  */
  async nft_mint(args: {
    token_id: TokenId;
    token_owner_id: AccountId;
    token_metadata: TokenMetadata;
  }, options?: ChangeMethodOptions): Promise<Token> {
    return providers.getTransactionLastResult(await this.nft_mintRaw(args, options));
  }
  /**
  * Mint a new token with ID=`token_id` belonging to `token_owner_id`.
  * 
  * Since this example implements metadata, it also requires per-token metadata to be provided
  * in this call. `self.tokens.mint` will also require it to be Some, since
  * `StorageKey::TokenMetadata` was provided at initialization.
  * 
  * `self.tokens.mint` will enforce `predecessor_account_id` to equal the `owner_id` given in
  * initialization call to `new`.
  */
  nft_mintRaw(args: {
    token_id: TokenId;
    token_owner_id: AccountId;
    token_metadata: TokenMetadata;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_mint", args, ...options});
  }
  /**
  * Mint a new token with ID=`token_id` belonging to `token_owner_id`.
  * 
  * Since this example implements metadata, it also requires per-token metadata to be provided
  * in this call. `self.tokens.mint` will also require it to be Some, since
  * `StorageKey::TokenMetadata` was provided at initialization.
  * 
  * `self.tokens.mint` will enforce `predecessor_account_id` to equal the `owner_id` given in
  * initialization call to `new`.
  */
  nft_mintTx(args: {
    token_id: TokenId;
    token_owner_id: AccountId;
    token_metadata: TokenMetadata;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("nft_mint", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Get number of tokens owned by a given account
  * 
  * Arguments:
  * * `account_id`: a valid NEAR account
  * 
  * Returns the number of non-fungible tokens owned by given `account_id` as
  * a string representing the value as an unsigned 128-bit integer to avoid JSON
  * number limit of 2^53.
  */
  nft_supply_for_owner(args: {
    account_id: AccountId;
  }, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "nft_supply_for_owner", args, options);
  }
  nft_metadata(args = {}, options?: ViewFunctionOptions): Promise<NftContractMetadata> {
    return this.account.viewFunction(this.contractId, "nft_metadata", args, options);
  }
  /**
  * Get list of all tokens owned by a given account
  * 
  * Arguments:
  * * `account_id`: a valid NEAR account
  * * `from_index`: a string representing an unsigned 128-bit integer,
  * representing the starting index of tokens to return. (default 0)
  * * `limit`: the maximum number of tokens to return. (default unlimited)
  * Could fail on gas
  * 
  * Returns a paginated list of all tokens owned by this account
  */
  nft_tokens_for_owner(args: {
    account_id: AccountId;
    from_index?: U128;
    limit?: u64;
  }, options?: ViewFunctionOptions): Promise<Token[]> {
    return this.account.viewFunction(this.contractId, "nft_tokens_for_owner", args, options);
  }
  async nft_mint_two(args: {
    token_owner_id: AccountId;
  }, options?: ChangeMethodOptions): Promise<Token> {
    return providers.getTransactionLastResult(await this.nft_mint_twoRaw(args, options));
  }
  nft_mint_twoRaw(args: {
    token_owner_id: AccountId;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_mint_two", args, ...options});
  }
  nft_mint_twoTx(args: {
    token_owner_id: AccountId;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("nft_mint_two", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async nft_mint_one(args: {
    token_owner_id: AccountId;
  }, options?: ChangeMethodOptions): Promise<Token> {
    return providers.getTransactionLastResult(await this.nft_mint_oneRaw(args, options));
  }
  nft_mint_oneRaw(args: {
    token_owner_id: AccountId;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_mint_one", args, ...options});
  }
  nft_mint_oneTx(args: {
    token_owner_id: AccountId;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("nft_mint_one", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
}
/**
* Revoke all approved accounts for a specific token.
* 
* Requirements
* * Caller of the method must attach a deposit of 1 yoctoⓃ for security
* purposes
* * If contract requires >1yN deposit on `nft_approve`, contract
* MUST refund all associated storage deposit when owner revokes approvals
* * Contract MUST panic if called by someone other than token owner
* 
* Arguments:
* * `token_id`: the token with approvals to revoke
* 
* @contractMethod change
*/
export interface NftRevokeAll {
  args: {
    token_id: TokenId;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default 0
    */
    attachedDeposit?: Balance;
  }
  
}
export type NftRevokeAll__Result = void;
/**
* Simple transfer. Transfer a given `token_id` from current owner to
* `receiver_id`.
* 
* Requirements
* * Caller of the method must attach a deposit of 1 yoctoⓃ for security purposes
* * Contract MUST panic if called by someone other than token owner or,
* if using Approval Management, one of the approved accounts
* * `approval_id` is for use with Approval Management,
* see <https://nomicon.io/Standards/NonFungibleToken/ApprovalManagement.html>
* * If using Approval Management, contract MUST nullify approved accounts on
* successful transfer.
* * TODO: needed? Both accounts must be registered with the contract for transfer to
* succeed. See see <https://nomicon.io/Standards/StorageManagement.html>
* 
* Arguments:
* * `receiver_id`: the valid NEAR account receiving the token
* * `token_id`: the token to transfer
* * `approval_id`: expected approval ID. A number smaller than
* 2^53, and therefore representable as JSON. See Approval Management
* standard for full explanation.
* * `memo` (optional): for use cases that may benefit from indexing or
* providing information for a transfer
* 
* @contractMethod change
*/
export interface NftTransfer {
  args: {
    receiver_id: AccountId;
    token_id: TokenId;
    approval_id?: u64;
    memo?: string;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default 0
    */
    attachedDeposit?: Balance;
  }
  
}
export type NftTransfer__Result = void;
/**
* Check if a token is approved for transfer by a given account, optionally
* checking an approval_id
* 
* Arguments:
* * `token_id`: the token for which to revoke an approval
* * `approved_account_id`: the account to check the existence of in `approvals`
* * `approval_id`: an optional approval ID to check against current approval ID for given account
* 
* Returns:
* if `approval_id` given, `true` if `approved_account_id` is approved with given `approval_id`
* otherwise, `true` if `approved_account_id` is in list of approved accounts
* 
* @contractMethod view
*/
export interface NftIsApproved {
  args: {
    token_id: TokenId;
    approved_account_id: AccountId;
    approval_id?: u64;
  };
  
}
export type NftIsApproved__Result = boolean;
/**
* Get a list of all tokens
* 
* Arguments:
* * `from_index`: a string representing an unsigned 128-bit integer,
* representing the starting index of tokens to return. (default 0)
* * `limit`: the maximum number of tokens to return (default total supply)
* Could fail on gas
* 
* Returns an array of Token objects, as described in Core standard
* 
* @contractMethod view
*/
export interface NftTokens {
  args: {
    from_index?: U128;
    limit?: u64;
  };
  
}
export type NftTokens__Result = Token[];
/**
* Transfer token and call a method on a receiver contract. A successful
* workflow will end in a success execution outcome to the callback on the NFT
* contract at the method `nft_resolve_transfer`.
* 
* You can think of this as being similar to attaching native NEAR tokens to a
* function call. It allows you to attach any Non-Fungible Token in a call to a
* receiver contract.
* 
* Requirements:
* * Caller of the method must attach a deposit of 1 yoctoⓃ for security
* purposes
* * Contract MUST panic if called by someone other than token owner or,
* if using Approval Management, one of the approved accounts
* * The receiving contract must implement `ft_on_transfer` according to the
* standard. If it does not, FT contract's `ft_resolve_transfer` MUST deal
* with the resulting failed cross-contract call and roll back the transfer.
* * Contract MUST implement the behavior described in `ft_resolve_transfer`
* * `approval_id` is for use with Approval Management extension, see
* that document for full explanation.
* * If using Approval Management, contract MUST nullify approved accounts on
* successful transfer.
* 
* Arguments:
* * `receiver_id`: the valid NEAR account receiving the token.
* * `token_id`: the token to send.
* * `approval_id`: expected approval ID. A number smaller than
* 2^53, and therefore representable as JSON. See Approval Management
* standard for full explanation.
* * `memo` (optional): for use cases that may benefit from indexing or
* providing information for a transfer.
* * `msg`: specifies information needed by the receiving contract in
* order to properly handle the transfer. Can indicate both a function to
* call and the parameters to pass to that function.
* 
* @contractMethod change
*/
export interface NftTransferCall {
  args: {
    receiver_id: AccountId;
    token_id: TokenId;
    approval_id?: u64;
    memo?: string;
    msg: string;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default 0
    */
    attachedDeposit?: Balance;
  }
  
}
export type NftTransferCall__Result = void;
/**
* Initializes the contract owned by `owner_id` with
* default metadata (for example purposes only).
* 
* @contractMethod change
*/
export interface NewDefaultMeta {
  args: {
    owner_id: AccountId;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default 0
    */
    attachedDeposit?: Balance;
  }
  
}
export type NewDefaultMeta__Result = void;
/**
* Revoke an approved account for a specific token.
* 
* Requirements
* * Caller of the method must attach a deposit of 1 yoctoⓃ for security
* purposes
* * If contract requires >1yN deposit on `nft_approve`, contract
* MUST refund associated storage deposit when owner revokes approval
* * Contract MUST panic if called by someone other than token owner
* 
* Arguments:
* * `token_id`: the token for which to revoke an approval
* * `account_id`: the account to remove from `approvals`
* 
* @contractMethod change
*/
export interface NftRevoke {
  args: {
    token_id: TokenId;
    account_id: AccountId;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default 0
    */
    attachedDeposit?: Balance;
  }
  
}
export type NftRevoke__Result = void;
/**
* Returns the token with the given `token_id` or `null` if no such token.
* 
* @contractMethod view
*/
export interface NftToken {
  args: {
    token_id: TokenId;
  };
  
}
export type NftToken__Result = Token | null;
/**
* 
* @contractMethod change
*/
export interface New {
  args: {
    owner_id: AccountId;
    metadata: InitialMetadata;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default 0
    */
    attachedDeposit?: Balance;
  }
  
}
export type New__Result = void;
/**
* Returns the total supply of non-fungible tokens as a string representing an
* unsigned 128-bit integer to avoid JSON number limit of 2^53.
* 
* @contractMethod view
*/
export interface NftTotalSupply {
  args: {};
  
}
export type NftTotalSupply__Result = U128;
/**
* Add an approved account for a specific token.
* 
* Requirements
* * Caller of the method must attach a deposit of at least 1 yoctoⓃ for
* security purposes
* * Contract MAY require caller to attach larger deposit, to cover cost of
* storing approver data
* * Contract MUST panic if called by someone other than token owner
* * Contract MUST panic if addition would cause `nft_revoke_all` to exceed
* single-block gas limit
* * Contract MUST increment approval ID even if re-approving an account
* * If successfully approved or if had already been approved, and if `msg` is
* present, contract MUST call `nft_on_approve` on `account_id`. See
* `nft_on_approve` description below for details.
* 
* Arguments:
* * `token_id`: the token for which to add an approval
* * `account_id`: the account to add to `approvals`
* * `msg`: optional string to be passed to `nft_on_approve`
* 
* Returns void, if no `msg` given. Otherwise, returns promise call to
* `nft_on_approve`, which can resolve with whatever it wants.
* 
* @contractMethod change
*/
export interface NftApprove {
  args: {
    token_id: TokenId;
    account_id: AccountId;
    msg?: string;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default 0
    */
    attachedDeposit?: Balance;
  }
  
}
export type NftApprove__Result = void;
/**
* Mint a new token with ID=`token_id` belonging to `token_owner_id`.
* 
* Since this example implements metadata, it also requires per-token metadata to be provided
* in this call. `self.tokens.mint` will also require it to be Some, since
* `StorageKey::TokenMetadata` was provided at initialization.
* 
* `self.tokens.mint` will enforce `predecessor_account_id` to equal the `owner_id` given in
* initialization call to `new`.
* 
* @contractMethod change
*/
export interface NftMint {
  args: {
    token_id: TokenId;
    token_owner_id: AccountId;
    token_metadata: TokenMetadata;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default 0
    */
    attachedDeposit?: Balance;
  }
  
}
export type NftMint__Result = Token;
/**
* Get number of tokens owned by a given account
* 
* Arguments:
* * `account_id`: a valid NEAR account
* 
* Returns the number of non-fungible tokens owned by given `account_id` as
* a string representing the value as an unsigned 128-bit integer to avoid JSON
* number limit of 2^53.
* 
* @contractMethod view
*/
export interface NftSupplyForOwner {
  args: {
    account_id: AccountId;
  };
  
}
export type NftSupplyForOwner__Result = U128;
/**
* 
* @contractMethod view
*/
export interface NftMetadata {
  args: {};
  
}
export type NftMetadata__Result = NftContractMetadata;
/**
* Get list of all tokens owned by a given account
* 
* Arguments:
* * `account_id`: a valid NEAR account
* * `from_index`: a string representing an unsigned 128-bit integer,
* representing the starting index of tokens to return. (default 0)
* * `limit`: the maximum number of tokens to return. (default unlimited)
* Could fail on gas
* 
* Returns a paginated list of all tokens owned by this account
* 
* @contractMethod view
*/
export interface NftTokensForOwner {
  args: {
    account_id: AccountId;
    from_index?: U128;
    limit?: u64;
  };
  
}
export type NftTokensForOwner__Result = Token[];
/**
* 
* @contractMethod change
*/
export interface NftMintTwo {
  args: {
    token_owner_id: AccountId;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default 0
    */
    attachedDeposit?: Balance;
  }
  
}
export type NftMintTwo__Result = Token;
/**
* 
* @contractMethod change
*/
export interface NftMintOne {
  args: {
    token_owner_id: AccountId;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default 0
    */
    attachedDeposit?: Balance;
  }
  
}
export type NftMintOne__Result = Token;
