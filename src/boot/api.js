import { Api, JsonRpc } from "eosjs";
import axios from 'axios';

const signTransaction = async function (actions) {
  actions.forEach((action) => {
    if (!action.authorization || !action.authorization.length) {
      action.authorization = [
        {
          actor: this.state.account.accountName,
          permission: "active",
        },
      ];
    }
  });
  let transaction = null;
  try {
    if (this.$type === "ual") {
      transaction = await this.$ualUser.signTransaction(
        {
          actions,
        },
        {
          blocksBehind: 3,
          expireSeconds: 30,
        }
      );
    }
  } catch (e) {
    console.log(actions, e.cause.message);
    throw e.cause.message;
  }
  return transaction;
};

const getRpc = function () {
  return this.$type === "ual" ? this.$ualUser.rpc : this.$defaultApi.rpc;
};

const getTableRows = async function (options) {
  const rpc = this.$api.getRpc();
  return await rpc.get_table_rows({
    json: true,
    ...options,
  });
};

const getAccount = async function (accountName) {
  const rpc = this.$api.getRpc();
  return await rpc.get_account(accountName);
};

const getCurrentChainAccount = async function (accountName) {
  var rpc = this.$defaultApi.rpc;
  return await rpc.get_account(accountName);
};

const setAPI = async function (store) {
  // TODO really slower than mixin, but so much cleaner
  console.log("setAPI");
  if (localStorage.getItem("selectedChain") != null) {
    await store.dispatch(
      "blockchains/updateCurrentChain",
      localStorage.getItem("selectedChain")
    );
  } else {
    await store.dispatch("blockchains/updateCurrentChain", "TELOS");
  }
  // console.log(store);
  let getCurrentChain = store.getters["blockchains/getCurrentChain"];
  const rpc = new JsonRpc(
    `${getCurrentChain.NETWORK_PROTOCOL}://${getCurrentChain.NETWORK_HOST}:${getCurrentChain.NETWORK_PORT}`
  );
  // console.log(`${getCurrentChain.NETWORK_PROTOCOL}://${getCurrentChain.NETWORK_HOST}:${getCurrentChain.NETWORK_PORT}`);
  const hyperion = axios.create({
    baseURL: getCurrentChain.HYPERION_ENDPOINT,
  });
  store["$defaultApi"] = new Api({
    rpc,
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder(),
  });

  store["$api"] = {
    signTransaction: signTransaction.bind(store),
    getTableRows: getTableRows.bind(store),
    getAccount: getAccount.bind(store),
    getRpc: getRpc.bind(store),
    setAPI: setAPI.bind(store),
    getCurrentChainAccount: getCurrentChainAccount.bind(store),
    hyperion: hyperion,
  };
};

export default async ({ store }) => {
  setAPI(store);
};
