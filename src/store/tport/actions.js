import { ethers } from "ethers";

// Get evm bridge tokens from tokens table of tport.start
export const updateTPortTokens = async function ({ commit, getters }) {
    try {
        let tokens = [];
        const tableResults = await this.$api.getTableRows({
            code: process.env.TPORT_ADDRESS,
            scope: process.env.TPORT_ADDRESS,
            table: "tokens",
            limit: 10000,
            reverse: false,
            show_payer: false,
        });
        for (let asset of tableResults.rows) {
            asset = {
                ...asset,
                symbol: this.$getSymFromAsset(asset.token),
                decimals: this.$getDecimalFromAsset(asset.token),
                contract: asset.token.contract,
                amount: 0,
            };
            tokens.push(asset);
        }
        commit("setTPortTokens", { tokens });
    } catch (error) {
        commit("general/setErrorMsg", error.message || error, { root: true });
    }
};

export const updateTeleports = async function ({ commit }, account) {
    try {
        if (account !== null) {
            let res = await this.$api.getTableRows({
                code: process.env.TPORT_ADDRESS,
                scope: process.env.TPORT_ADDRESS,
                table: "teleports",
                key_type: "i64",
                index_position: 2,
                lower_bound: account,
                upper_bound: account,
                limit: 10000,
                reverse: true,
                show_payer: false,
            });

            let teleports = [];
            res.rows.forEach((r) => {
                r.processing = r.oracles.length <= 1;
                teleports.push(r);
            });

            var options = {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
            };
            teleports = teleports
                .map((t) => {
                    if (t.date) {
                        t.time = new Date(t.date + "Z").valueOf();
                        t.displaydate = new Date(t.date + "Z");
                    } else {
                        t.displaydate = new Date(t.time * 1000).toLocaleDateString(
                            "en-US",
                            options
                        );
                    }
                    return t;
                })
                .sort((a, b) => (a.time < b.time ? 1 : -1));

            // console.log("Teleports:", teleports);
            commit("setTeleports", { teleports });
        }
    } catch (error) {
        commit("general/setErrorMsg", error.message || error, { root: true });
    }
};

export const updateTportTokenBalances12 = async function (
    { rootGetters, dispatch },
    injectedWeb3,
    web3,
    erc20abi
) {
    if (rootGetters["bridge/getToNative"]) {
        return dispatch("updateTportTokenBalancesEvm", {
            injectedWeb3,
            web3,
            erc20abi,
        });
    } else {
        return dispatch("updateTportTokenBalancesNative");
    }
};

export const updateTportTokenBalances = async function ({
    commit,
    getters,
    rootGetters,
}) {
    try {
        var accountName = rootGetters["account/accountName"];
        if (accountName !== null) {
            let tokens = getters.getTPortTokens;
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
                    // console.log("balance:")
                    // console.log(balance)
                    if (balance !== undefined) {
                        let precision = this.$assetToPrecision(balance);
                        if (token.token.decimals === 0) {
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

export const updateTportTokenBalancesEvm = async function (
    { commit, getters, rootGetters }
) {
    try {
        if (getters.getEvmChainId && getters.getEvmAccountName) {
            const { injectedWeb3, web3 } = await this._vm.$web3();
            let tokens = getters.getTPortTokens;
            let balance = 0;
            for (const token of tokens) {
                try {
                    if (injectedWeb3) {
                        if (
                            wrongNetwork(
                                getters.getEvmNetwork,
                                rootGetters["bridge/getFromChain"]
                            )
                        )
                            balance = 0;
                        else {
                            // console.log("TPort token:", token);
                            if (typeof token === "undefined") {
                                console.error("TPort Token not found");
                            } else {
                                const remoteContractAddress = token.remote_contracts.find(
                                    (el) => el.key === getters.getEvmRemoteId
                                ).value;
                                // console.log("remoteContractAddress:", remoteContractAddress);
                                const remoteInstance = new web3.eth.Contract(
                                    this._vm.$erc20Abi,
                                    remoteContractAddress
                                ); // TODO Add check to validate abi
                                // console.log("remoteInstance:", remoteInstance);
                                const remotebalance = await remoteInstance.methods
                                    .balanceOf(getters.getEvmAccountName)
                                    .call();
                                balance = Number(
                                    parseFloat(
                                        ethers.utils
                                            .formatUnits(
                                                remotebalance,
                                                await remoteInstance.methods.decimals().call()
                                            )
                                            .toString()
                                    ).toFixed(token.decimals)
                                );
                                // console.log("Balance is:", balance);

                            }
                        }
                    }

                    if (balance !== undefined) {
                        let precision = this.$assetToPrecision(balance);
                        if (token.token.decimals === 0) {
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
                // console.log("balance:", balance);
            }
        }
    } catch (error) {
        console.log("Error getting chain token balance:", error);
        commit("general/setErrorMsg", error.message || error, { root: true });
    }
};

function wrongNetwork(evmNetwork, selectedNetwork) {
    if (evmNetwork) {
        return (
            evmNetwork.name.toUpperCase() !==
            selectedNetwork.NETWORK_NAME.toUpperCase()
        );
    } else return true;
}

export const updateWeb3 = async function ({ commit }, web3, injectedWeb3) {
    commit("setWeb3", web3);
    commit("setInjectedWeb3", injectedWeb3);
};
