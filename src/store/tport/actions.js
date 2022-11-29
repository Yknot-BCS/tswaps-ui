import { ethers } from "ethers";

// Get evm bridge tokens from tokens table of tport.start
export const updateTPortTokens = async function ({ commit, getters }, details) {
    var contract = null;
    var chain = null;
    if (details) {
        if (details.contract)
            contract = details.contract;
        if (details.chain)
            chain = details.chain;
    }
    // console.log(contract, chain);
    if (contract == null)
        contract = process.env.TPORT_ADDRESS;
    if (chain == null)
        chain = process.env.TPORT_ADDRESS;
    try {
        let tokens = [];
        const tableResults = await this.$api.getTableRows({
            code: contract,
            scope: chain,
            table: "tokens",
            limit: 10000,
            reverse: false,
            show_payer: false,
        });
        for (let asset of tableResults.rows) {
            if ('token_info' in asset)
                asset.token = asset.token_info;
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

export const updateTelosDTokens = async function ({ commit, getters }) {
    var contract = "telosd.io";
    var chain = "telosd.io";
    try {
        let tokens = [];
        const tableResults = await this.$api.getTableRows({
            code: contract,
            scope: chain,
            table: "tokens",
            limit: 10000,
            reverse: false,
            show_payer: false,
        });
        for (let asset of tableResults.rows) {
            if ('token_info' in asset)
                asset.token = asset.token_info;
            asset = {
                ...asset,
                symbol: this.$getSymFromAsset(asset.token),
                decimals: this.$getDecimalFromAsset(asset.token),
                contract: asset.token.contract,
                amount: 0,
            };
            tokens.push(asset);
        }
        commit("setTelosDTokens", { tokens });
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

                        commit("setTeleports", { teleports });
        }
    } catch (error) {
        commit("general/setErrorMsg", error.message || error, { root: true });
    }
};

export const updateNativeTransactions = async function ({ 
    getters,
    commit
 }) {
    try {
        if (getters.getEvmAccountName) {
            commit("setEvmTransactionsUpdating",true);
            const hyperion = this.$api.hyperion;
            let path = `/v2/evm/get_transactions?address=${getters.getEvmAccountName}`;
            let res = await hyperion.get(path);
            let contractHash = "0xc2c93abca2f643a466435433928f08ce53d4f09d";
            let contractAbi = this._vm.$erc20Abi;
            let contractTrxs = res.data.transactions.filter((trx) => trx.to === contractHash);
            var tokenTransfersInfo = [];
            for (var i = 0; i < contractTrxs.length; i++) {
                var trx = contractTrxs[i];
                var logs = trx.logs;
                for (var j = 0; j < logs.length; j++) {
                    var log = logs[j];
                    var data = log.data;
                    var topics = log.topics;
                    var iface = new ethers.utils.Interface(contractAbi);
                    try {
                        var tokenTrxReturn = iface.parseLog({ data, topics });
                        function hex_to_ascii(str1) {
                            var hex  = str1.toString();
                            var str = '';
                            for (var n = 0; n < hex.length; n += 2) {
                                str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
                            }
                            return str;
                        }
                        if (tokenTrxReturn.name == "Teleport") {
                            tokenTransfersInfo.push({...tokenTrxReturn.args, ref: trx.hash});
                        }
                    }
                    catch (error) {

                    }
                }
            }
            var refs = tokenTransfersInfo.map((tokenTransferInfo) => { return tokenTransferInfo.ref});
            let receipts = await this.$api.getTableRows({
                code: process.env.TPORT_ADDRESS,
                scope: process.env.TPORT_ADDRESS,
                table: "receipts",
                key_type: "i64",
                limit: 10000,
                reverse: true,
                show_payer: false,
            });
            var obj = {};
            receipts.rows.map((row)=>{
                if (refs.includes(`0x${row.ref}`)) {
                    var newRowObj = {...row};
                    delete newRowObj.ref;
                    obj[row.ref] = newRowObj;
                }
            });
            // console.log(obj);
            let tokenTransfersInfoFinal = tokenTransfersInfo.map((tti) => {
                var ref = tti.ref.replace("0x","");
                return {
                    ...tti,
                    quantity: obj[ref].quantity,
                    date: obj[ref].date,
                    // chain_id: obj[ref].from_chain_id,
                };
            });
            commit("setEvmTransactions",{transactions:tokenTransfersInfoFinal});
            commit("setEvmTransactionsUpdating",false);
        }
    }
    catch (error) {
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

export const updateTelosDTokenBalances = async function ({
    commit,
    getters,
    rootGetters,
}) {
    try {
        var accountName = rootGetters["account/accountName"];
        if (accountName !== null) {
            let tokens = getters.getTelosDTokens;
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
                        if (token.token.decimals === 0) {
                            commit("setTokenPrecision", {
                                token: token,
                                precision: precision,
                            });
                        }
                        commit("setTelosDTokenAmount", {
                            token: token,
                            amount: this.$assetToAmount(balance),
                        });
                    } else {
                        commit("setTelosDTokenAmount", { token: token, amount: 0 });
                    }
                } catch (error) {
                    commit("setTelosDTokenAmount", { token: token, amount: 0 });
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
                                                        if (typeof token === "undefined") {
                                console.error("TPort Token not found");
                            } else {
                                const remoteContractAddress = token.remote_contracts.find(
                                    (el) => el.key === getters.getEvmRemoteId
                                ).value;
                                                                const remoteInstance = new web3.eth.Contract(
                                    this._vm.$erc20Abi,
                                    remoteContractAddress
                                ); // TODO Add check to validate abi
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
