// set new chain
export const updateCurrentChain = async function (
  { commit, getters, dispatch },
  selectedChain
) {
  let blockchains = getters.getNetworkByName(selectedChain);
  let newChain = {};

  // check if testnet or not
  if (process.env.TESTNET == "true") {
    newChain = blockchains.find((el) => el.TEST_NETWORK === true);
  } else {
    newChain = blockchains.find((el) => el.TEST_NETWORK === false);
  }

    
  commit("setCurrentChain", {
    newChain: newChain,
  });

  localStorage.setItem("selectedChain", newChain.NETWORK_NAME);
};

export const setNewChain = async function (
  { commit, getters, dispatch },
  selectedChain
) {
  let blockchains = getters.getNetworkByName(selectedChain);
  let newChain = {};

  // check if testnet or not
  if (process.env.TESTNET == "true") {
    newChain = blockchains.find((el) => el.TEST_NETWORK === true);
  } else {
    newChain = blockchains.find((el) => el.TEST_NETWORK === false);
  }

    
  commit("setCurrentChain", {
    newChain: newChain,
  });

  localStorage.setItem("selectedChain", newChain.NETWORK_NAME);
};

// Get cross chain tokens from tokens table of bridge.start
// export const setBridgeTokens = async function({ commit, getters }) {
//   try {
//     const currentChain = getters.getCurrentChain.NETWORK_NAME.toLowerCase();
//     let otherChains = ["telos", "eos", "wax"].filter(
//       (value, _index, _arr) => value !== currentChain
//     );
//     let tokens = [];
//     for (let chain of otherChains) {
//       const tableResults = await this.$api.getTableRows({
//         code: process.env.BRIDGE_ADDRESS,
//         scope: chain,
//         table: "tokens",
//         limit: 10000,
//         reverse: false,
//         show_payer: false
//       });
//       tokens.push(...tableResults.rows);
//     }
//     // return res;
//     // console.log("Bridge Tokens:", tokens);
//     commit("updateBridgeTokens", { tokens });
//   } catch (error) {
//     commit("general/setErrorMsg", error.message || error, { root: true });
//   }
// };
