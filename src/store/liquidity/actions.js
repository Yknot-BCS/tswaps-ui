export const updateActivePool = async function ({
  commit,
  rootGetters,
  getters,
}) {
  try {
    const fromToken = getters.getToken1;
    const toToken = getters.getToken2;
    const pools = rootGetters["pools/getPools"];
    const swapPoolId = fromToken?.toTokens?.find(
      (token) =>
        token.contract == toToken.contract && token.symbol == toToken.symbol
    )?.pool;
    if (swapPoolId) {
      const pool = pools.find((p) => p.id == swapPoolId);
      commit("setPool", pool);
      commit("setHasPool", true);
      commit("setErrorMsg", "");
    } else {
      commit("setPool", {});
      commit("setHasPool", false);
      commit("setErrorMsg", "No pool available");
    }
  } catch (error) {
    console.log("Error getting swap pool", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateValue1 = async function ({ commit, getters }, amount) {
  try {
    commit("setValue1", amount);
    const token1 = getters.getToken1;
    if (getters.getHasPool) {
      let estimate = 0;
      let pool = getters.getPool;
      if (Number(pool?.price0_last) !== 0) {
        if (token1.symbol == pool?.reserve0?.symbol) {
          estimate = Number(amount) * Number(pool?.price0_last);
        } else {
          estimate = Number(amount) * Number(pool?.price1_last);
        }
        estimate = this.$truncate(estimate, getters.getToken2.precision);
        commit("setValue2", estimate);
      }
    } else {
      // commit("setValue2", 0);
    }
  } catch (error) {
    console.log("Error updating value", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateValue2 = async function ({ commit, getters }, amount) {
  try {
    commit("setValue2", amount);
    const token2 = getters.getToken2;
    if (getters.getHasPool) {
      let estimate = 0;
      let pool = getters.getPool;
      if (Number(pool?.price0_last) !== 0) {
        if (token2.symbol == pool?.reserve0?.symbol) {
          estimate = Number(amount) * Number(pool?.price0_last);
        } else {
          estimate = Number(amount) * Number(pool?.price1_last);
        }
        estimate = this.$truncate(estimate, getters.getToken1.precision);
        commit("setValue1", estimate);
      }
    } else {
      // commit("setValue1", 0);
    }
  } catch (error) {
    console.log("Error updating value", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};

export const updateSelectedTokenBalance = async function ({
  commit,
  getters,
  rootGetters,
}) {
  try {
    const fromToken = getters.getToken1;
    const toToken = getters.getToken2;
    const tokens = rootGetters["tokens/getTokens"];
    let newToken = tokens?.find(
      (token) =>
        token.contract == toToken?.contract && token.symbol == toToken?.symbol
    );
    if (newToken) {
      commit("setToken2", newToken);
    }
    newToken = tokens?.find(
      (token) =>
        token.contract == fromToken?.contract &&
        token.symbol == fromToken?.symbol
    );
    if (newToken) {
      commit("setToken1", newToken);
    }
  } catch (error) {
    console.log("Error creating memo", error);
    commit("general/setErrorMsg", error.message || error, { root: true });
  }
};
