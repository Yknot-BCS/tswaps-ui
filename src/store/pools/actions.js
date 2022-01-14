export const updatePools = async function({
  commit,
  rootGetters
}){
    try {
        const pools = []
        const getCurrentChain = rootGetters[
            "blockchains/getCurrentChain"
          ].NETWORK_NAME.toLowerCase();
          let temp_pools = [];

          const tableResults = await this.$api.getTableRows({
            code: process.env.SWAP_CONTRACT,
            scope: process.env.SWAP_CONTRACT,
            table: "pairs",
            limit: 10000,
            reverse: false,
            show_payer: false
          });
          
          temp_pools.push(...tableResults.rows);
      
          for (const pool of temp_pools) {
      
            let res0 = pool.reserve0
            let res1 = pool.reserve1
      
            let temp_pool = {...pool,
                token0_symbol: this.$exSymToSymbol(res0),
                token1_symbol: this.$exSymToSymbol(res1),
                reserve0:{
                    quantity: this.$getQuantity(res0),
                    symbol: this.$exSymToSymbol(res0),
                    precision: this.$exSymToPrecision(res0),
                    contract: res0.contract
                },
                reserve1:{
                    quantity: this.$getQuantity(res1),
                    symbol: this.$exSymToSymbol(res1),
                    precision: this.$exSymToPrecision(res1),
                    contract: res1.contract
                },
                contract0: res0.contract,
                contract1: res1.contract,
                chain: getCurrentChain
            }
      
           // Check duplicates for pools
            if (
              !pools.find(
                t =>
                  t.id === pool.id 
              )
            ) {
              pools.push(temp_pool);
            }
          }

        commit("setPools", pools);
        
    } catch (error) {
        commit("general/setErrorMsg", error.message || error, { root: true });
    }
}

export const updateUserLiquidityPools = async function({
  commit,
  rootGetters
}){
    try {
        const pools = []
        commit("setUserLiquidityPools", pools);
    } catch (error) {
        commit("general/setErrorMsg", error.message || error, { root: true });
    }
}
