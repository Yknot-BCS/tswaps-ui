// Get tokens from tokens table
export const updateTokens = async function ({
  commit,
  rootGetters,
  dispatch,
  getters,
}) {
  try {
    const getCurrentChain =
      rootGetters["blockchains/getCurrentChain"].NETWORK_NAME.toLowerCase();
    let pools = [];
    let tokens = JSON.parse(JSON.stringify(getters.getTokens)) || [];

    const tableResults = await this.$api.getTableRows({
      code: process.env.SWAP_CONTRACT,
      scope: process.env.SWAP_CONTRACT,
      table: "pairs",
      limit: 10000,
      reverse: false,
      show_payer: false,
    });
        pools.push(...tableResults.rows);

    for (const pool of pools) {
      let res0 = pool.reserve0;
      let res1 = pool.reserve1;

      let token0 = {
        symbol: this.$exAssToSymbol(res0),
        contract: res0.contract,
        precision: this.$exAssToPrecision(res0),
        chain: getCurrentChain,
        logo: "",
        toTokens: [],
      };

      let token1 = {
        symbol: this.$exAssToSymbol(res1),
        contract: res1.contract,
        precision: this.$exAssToPrecision(res1),
        chain: getCurrentChain,
        logo: "",
        toTokens: [],
      };

      const checkDuplicates = function (tokens, token, tokenTo) {
        // Check duplicates for token
        if (
          tokens.find(
            (t) =>
              t.symbol === token.symbol &&
              t.chain === token.chain &&
              t.contract === token.contract
          )
        ) {
          // append toToken
          let index = tokens.findIndex(
            (t) =>
              t.symbol === token.symbol &&
              t.chain === token.chain &&
              t.contract === token.contract
          );
          tokens[index].toTokens.push({
            contract: tokenTo.contract,
            symbol: tokenTo.symbol,
            precision: tokenTo.precision,
            pool: pool.id,
          });
        } else {
          token.toTokens.push({
            contract: tokenTo.contract,
            symbol: tokenTo.symbol,
            precision: tokenTo.precision,
            pool: pool.id,
          });
          tokens.push(token);
        }
      };

      // Check duplicates
      checkDuplicates(tokens, token0, token1);
      checkDuplicates(tokens, token1, token0);
    }

    // Load tokens from local storage
    let localTokens = JSON.parse(localStorage.getItem("tokens")) || [];
    if (localTokens.length > 0) {
      localTokens = localTokens.filter(
        (val) =>
          !tokens.find(
            (t) =>
              t.contract === val.contract &&
              t.symbol === val.symbol &&
              t.chain === val.chain
          )
      );
      tokens.push(...localTokens);
    }

    commit("setTokens", { tokens });

    await dispatch("updateKnownLogos");
  } catch (error) {
    console.error("Error getting tokens:", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateAddNewToken = async function (
  { commit, getters, rootGetters, dispatch },
  payload
) {
  try {
    const getCurrentChain =
      rootGetters["blockchains/getCurrentChain"].NETWORK_NAME.toLowerCase();
    let contract = payload.contract;
    let symbol = payload.symbol;
    let accountName = payload.accountName;
    let logo = payload?.logo;
    let tokens = JSON.parse(JSON.stringify(getters.getTokens));

    
    // check duplicates
    let token = {
      symbol: symbol,
      contract: contract,
      precision: 0,
      chain: getCurrentChain,
      logo: logo,
      toTokens: [],
    };

    // Check duplicates for token
    if (
      !tokens.find(
        (t) =>
          t.symbol === token.symbol &&
          t.chain === token.chain &&
          t.contract === token.contract
      )
    ) {
      tokens.push(token);
    }

    // add token
    commit("setTokens", { tokens });

    // update balance
    if (accountName !== undefined) {
      await dispatch("updateTokenBalances", accountName);
    }
    let newToken = getters.getTokens.find(
      (t) =>
        t.symbol === token.symbol &&
        t.chain === token.chain &&
        t.contract === token.contract
    );

    // add to local storage
    let localTokens = JSON.parse(localStorage.getItem("tokens")) || [];
    if (
      !localTokens.find(
        (t) =>
          t.symbol === newToken.symbol &&
          t.chain === newToken.chain &&
          t.contract === newToken.contract
      )
    ) {
      localTokens.push(newToken);
    }
    let parsed = JSON.stringify(localTokens);
    localStorage.setItem("tokens", parsed);
      } catch (error) {
    console.error("Error adding token:", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateRemoveToken = async function (
  { commit, getters, rootGetters, dispatch },
  payload
) {
  try {
    const getCurrentChain =
      rootGetters["blockchains/getCurrentChain"].NETWORK_NAME.toLowerCase();
    let contract = payload.contract;
    let symbol = payload.symbol;
    let accountName = payload.accountName;
    let tokens = getters.getTokens;
    let localTokens = JSON.parse(localStorage.getItem("tokens")) || [];

    // remove token
    let index = localTokens.findIndex(
      (t) =>
        t.symbol === symbol &&
        t.chain === getCurrentChain &&
        t.contract === contract
    );
    localTokens.splice(index, 1);
    index = tokens.findIndex(
      (t) =>
        t.symbol === symbol &&
        t.chain === getCurrentChain &&
        t.contract === contract
    );
    tokens.splice(index, 1);

    // add to local storage
    let parsed = JSON.stringify(localTokens);
    localStorage.setItem("tokens", parsed);

    // update tokens
    commit("setTokens", { tokens });
  } catch (error) {
    console.error("Error removing token:", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateTokenBalances = async function (
  { commit, getters },
  accountName
) {
  try {
    if (accountName !== null) {
      let tokens = getters.getTokens;
      const rpc = this.$api.getRpc();
      for (const token of tokens) {
        try {
          let balance = (
            await rpc.get_currency_balance(
              token.contract,
              accountName,
              token.symbol
            )
          )[0];
                              if (balance !== undefined) {
            let precision = this.$assetToPrecision(balance);
            if (token.precision === 0) {
              commit("setTokenPrecision", {
                token: token,
                precision: precision,
              });
            }
            commit("setTokenAmount", {
              token: token,
              amount: this.$assetToAmount(balance),
            });
          } else {
            commit("setTokenAmount", { token: token, amount: 0 });
          }
        } catch (error) {
          commit("setTokenAmount", { token: token, amount: 0 });
        }
      }
    }
  } catch (error) {
    console.log("Error getting chain token balance:", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// Get TLOS usd value
export const updateUsdValue = async function ({
  commit,
  getters,
  rootGetters,
}) {
  const tlosUsdDataPoints = await this.$api.getTableRows({
    code: "delphioracle",
    limit: "1000",
    scope: "tlosusd",
    table: "datapoints",
  });

  const tlosPrice = tlosUsdDataPoints.rows[0].median / 10000;

  commit("setUsdPrice", { token: getters.getTLOSToken, price: tlosPrice });
};

// Get known tokens
export const updateKnownLogos = async function ({
  commit,
  getters,
  rootGetters,
  dispatch,
}) {
  try {
    let tokens = JSON.parse(JSON.stringify(getters.getTokens));

    // Get tokens list json from external url
    let tokenURL =
      "https://raw.githubusercontent.com/Telos-Swaps/Tokens/main/tokens.json";
    let tokensList = [];
    let new_tokens = [];

    await this.$axios
      .get(tokenURL)
      .then((response) => {
        tokensList = response.data;
      })
      .catch((error) => console.log("Error", error.message));

    for (const token of tokens) {
      let tokenInfo = tokensList.find(
        (t) => t.symbol === token.symbol && t.account === token.contract
      );
      if (tokenInfo) {
        token.logo = tokenInfo.logo;
      }
      new_tokens.push(token);
    }

    commit("setTokens", { tokens: new_tokens });
  } catch (error) {
    console.error("updateKnownLogos", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

// Update all tokens balances
export const updateAllTokensBalances = async function (
  { commit, dispatch, rootGetters },
  accountName
) {
  try {
    const getCurrentChain =
      rootGetters["blockchains/getCurrentChain"].NETWORK_NAME.toLowerCase();

    if (accountName !== null) {
      const userCoins = await this.$hyperion.get(
        `/v2/state/get_tokens?account=${accountName}&limit=1000`
      );
      
      let new_tokens = [];

      for (const token of userCoins.data.tokens) {
        token.chain = getCurrentChain;
        token.toTokens = [];
        if (token.contract !== process.env.LPTOKEN_CONTRACT) {
          new_tokens.push(token);
        }
      }

      commit("setTokens", { tokens: new_tokens });
    }
  } catch (error) {
    console.log("Error getting all tokens balances:", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};
