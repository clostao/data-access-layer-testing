import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { SubmittableResultValue } from "@polkadot/api/types";
import { createApi, createKeyPair, getAccountNonce } from "./networkApi.js";
import { Transaction, TransactionResult } from "./types.js";

const MAX_BATCH_SIZE = 3000 * 1024; // 3 MiB

const submitBatchTransaction = async (
  api: ApiPromise,
  keyPair: KeyringPair,
  transactions: Transaction[],
  nonce: number
): Promise<TransactionResult[]> => {
  return new Promise((resolve, reject) => {
    const txs = transactions.map((tx) =>
      api.tx[tx.module][tx.method](...tx.params)
    );
    const batchTx = api.tx.utility.batchAll(txs);
    let unsubscribe: (() => void) | undefined;
    let isResolved = false;

    const timeout = setTimeout(() => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (!isResolved) {
        console.log(
          `Transaction timed out. Tx hash: ${batchTx.hash.toString()}`
        );
        reject(new Error("Transaction timeout"));
      }
    }, 180000); // 3 minutes timeout

    const cleanup = () => {
      clearTimeout(timeout);
      if (unsubscribe) {
        unsubscribe();
      }
    };

    batchTx
      .signAndSend(
        keyPair,
        { nonce },
        async (result: SubmittableResultValue) => {
          const { status, events, dispatchError } = result;

          console.log(
            `Current status: ${
              status.type
            }, Tx hash: ${batchTx.hash.toString()}`
          );

          if (status.isInBlock || status.isFinalized) {
            cleanup();
            isResolved = true;

            if (dispatchError) {
              let errorMessage;
              if (dispatchError.isModule) {
                const decoded = api.registry.findMetaError(
                  dispatchError.asModule
                );
                errorMessage = `${decoded.section}.${decoded.name}: ${decoded.docs}`;
              } else {
                errorMessage = dispatchError.toString();
              }
              resolve(
                transactions.map(() => ({
                  success: false,
                  batchTxHash: batchTx.hash.toString(),
                  status: status.type,
                  error: errorMessage,
                }))
              );
            } else {
              const results = transactions.map((_, index) => ({
                success: true,
                batchTxHash: batchTx.hash.toString(),
                blockHash: status.asInBlock.toString(),
                status: status.type,
                index,
              }));
              console.log(`In block: ${status.asInBlock.toString()}`);
              resolve(results);
            }
          } else if (status.isDropped || status.isInvalid || status.isUsurped) {
            cleanup();
            isResolved = true;
            reject(new Error(`Transaction ${status.type}`));
          }
        }
      )
      .then((unsub) => {
        unsubscribe = unsub;
      })
      .catch((error) => {
        cleanup();
        reject(error);
      });
  });
};

const createBatches = (
  api: ApiPromise,
  transactions: Transaction[]
): Transaction[][] => {
  const batches: Transaction[][] = [[]];
  let currentBatchSize = 0;

  transactions.forEach((tx) => {
    const txSize = api.tx[tx.module][tx.method](...tx.params).encodedLength;
    if (currentBatchSize + txSize > MAX_BATCH_SIZE) {
      batches.push([]);
      currentBatchSize = 0;
    }
    batches[batches.length - 1].push(tx);
    currentBatchSize += txSize;
  });

  return batches;
};

const submitBatchTransactions = async (
  api: ApiPromise,
  keyPair: KeyringPair,
  batches: Transaction[][],
  startNonce: number
): Promise<TransactionResult[]> => {
  let nonce = startNonce;
  const results: TransactionResult[] = [];

  for (const batch of batches) {
    const batchResults = await submitBatchTransaction(
      api,
      keyPair,
      batch,
      nonce
    );
    results.push(...batchResults);
    nonce++;
  }

  return results;
};

export const createTransactionManager = (
  rpcEndpoint: string,
  keypairUri: string
) => {
  let api: ApiPromise | null = null;
  let keyPair: KeyringPair | null = null;

  const initialize = async (): Promise<void> => {
    api = await createApi(rpcEndpoint);
    keyPair = createKeyPair(keypairUri);
  };

  const ensureInitialized = async (): Promise<void> => {
    if (!api || !keyPair) {
      await initialize();
    }
  };

  const submit = async (
    transactions: Transaction[]
  ): Promise<TransactionResult[]> => {
    await ensureInitialized();
    if (!api || !keyPair) {
      throw new Error("Transaction manager not initialized");
    }
    const nonce = await getAccountNonce(api, keyPair.address);
    console.log(`Starting nonce: ${nonce}`);

    const batches = createBatches(api, transactions);
    return await submitBatchTransactions(api, keyPair, batches, nonce);
  };

  return { submit };
};
