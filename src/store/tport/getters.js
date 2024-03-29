export function getEvmAccountName(state) {
  return state.accountName;
}

export function getEvmNetwork(state) {
  return state.networkList.find((el) => el.chainId === state.chainId);
}

export function getEvmChainId(state) {
  return state.chainId;
}

export function getEvmRemoteId(state) {
  const chain = state.networkList.find((el) => el.chainId === state.chainId);
  return chain ? chain.remoteId : null;
}

export function getEvmNetworkList(state) {
  return state.networkList;
}

export function getTeleports(state) {
  return state.teleports;
}

export function getEvmTransactions(state) {
  return state.evmTransactions;
}

export function isEvmTransactionsUpdating(state) {
  return state.evmTransactionsUpdating;
}

export const getTPortTokens = ({ tportTokens }) => tportTokens;
export const getTelosDTokens = ({ telosDTokens }) => telosDTokens;

export const getTPortTokensBySym =
  ({ tportTokens }) =>
  (sym) => {
    return tportTokens.find((el) => el.symbol === sym);
  };

export const getEvmNetworkByName =
  ({ networkList }) =>
  (name) => {
    return networkList.find(
      (el) => el.name.toUpperCase() === name.toUpperCase()
    );
  };
