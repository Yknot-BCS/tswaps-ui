<template>
  <q-dialog
    :value="showCoinDialog"
    @input="$emit('update:showCoinDialog', $event)"
    confirm
    class="dialogContainer"
  >
    <q-card class="dialogCard">
      <div class="dialogHeader">
        <div class="row justify-between items-center q-pt-sm">
          <div class="text-h6 q-pl-md">Select a token</div>
          <div class="q-pr-sm">
            <q-btn size="12px" flat dense round icon="clear" v-close-popup />
          </div>
        </div>
        <q-item class="q-mb-sm">
          <q-input
            v-model="search"
            @input="filterTokens()"
            outlined
            round
            placeholder="Search contract name or symbol"
            class="col"
          />
        </q-item>
        <div class="q-pl-md q-pb-sm q-pr-md">
          <q-item-label
            v-if="!addingToken"
            class="addToken"
            @click="addingToken = true"
            >Want to list your token? Do it here.</q-item-label
          >
          <div v-if="addingToken" class="fit row">
            <q-input
              v-model="newTokenContract"
              outlined
              round
              placeholder="Contract"
              class="col q-pr-xs"
            />
            <q-input
              v-model="newTokenSymbol"
              outlined
              round
              placeholder="Symbol"
              class="col-4 q-pr-xs"
            />

            <div>
              <div class="fit column">
                <q-btn
                  no-caps
                  size="sm"
                  class="addBtn col q-mb-xs"
                  label="Add"
                  @click="
                    updateAddNewToken({
                      contract: newTokenContract,
                      symbol: newTokenSymbol,
                      accountName: accountName,
                    });
                    addingToken = false;
                  "
                />
                <q-btn
                  no-caps
                  size="sm"
                  class="addBtn col"
                  label="Remove"
                  @click="
                    updateRemoveToken({
                      contract: newTokenContract,
                      symbol: newTokenSymbol,
                      accountName: accountName,
                    });
                    addingToken = false;
                  "
                />
              </div>
            </div>
          </div>
        </div>
        <q-separator />
      </div>
      <q-list class="dialogList">
        <q-item
          v-for="token in availableTokens"
          :key="`${token.contract}-${token.symbol}`"
          clickable
          v-close-popup
          @click="updateSelectedCoin(token)"
        >
          <q-item-section avatar>
            <token-avatar :token="token.symbol" :avatarSize="30" />
          </q-item-section>
          <q-item-section>
            <q-item-label> {{ token.symbol }}</q-item-label>
            <q-item-label caption>{{ token.contract }}</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>{{ token.amount }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="getTPortTokens.length == 0">No tokens found</q-item>
      </q-list>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import tokenAvatar from "src/components/TokenAvatar";
export default {
  components: { tokenAvatar },
  data() {
    return {
      search: "",
      filteredTokens: [],
      addingToken: false,
      newTokenContract: "",
      newTokenSymbol: "",
    };
  },
  props: ["showCoinDialog", "isFrom", "isSwap", "antelope"],
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("tport", ["getTPortTokens", "getTelosDTokens"]),
    ...mapGetters("blockchains", ["getAllPossibleChains", "getCurrentChain"]),
    ...mapGetters("bridge", [
      "getToChain",
      "getFromChain",
      "getToken",
      "getAmount",
      "getToNative",
    ]),
    availableTokens() {
      if (this.filteredTokens.length > 0) {
        return this.filteredTokens;
      } else {
        // return this.getTPortTokens;
        var tokens = [...this.getTPortTokens];
        const telosDChains = ["TELOS", "EOS"];
        var telosdTrx = telosDChains.includes(this.getFromChain.NETWORK_NAME) && telosDChains.includes(this.getToChain.NETWORK_NAME);
        if (telosdTrx)
          tokens.push(...this.getTelosDTokens);
        return tokens;
      }
    },
  },
  methods: {
    ...mapActions("swap", ["updateSwapPool", "updateEstimate"]),
    ...mapActions("liquidity", ["updateActivePool"]),
    ...mapActions("pools", ["updatePools"]),
    ...mapActions("tport", [
      "updateTPortTokens",
      "updateTportTokenBalances",
      "updateTportTokenBalancesEvm",
      "updateTelosDTokens",
      "updateTelosDTokenBalances"
    ]),
    ...mapActions("bridge", ["updateBridgeToken"]),
    ...mapActions("blockchains",["updateCurrentChain"]),

    updateSelectedCoin(token) {
      this.updateBridgeToken(token);
    },

    filterTokens() {
      // TODO Show all when no input
      console.log("Len: ", this.search.length);
      var tokens = [...this.getTPortTokens];
      const telosDChains = ["TELOS", "EOS"];
      var telosdTrx = telosDChains.includes(this.getFromChain.NETWORK_NAME) && telosDChains.includes(this.getToChain.NETWORK_NAME);
      if (telosdTrx)
        tokens.push(...this.getTelosDTokens);
      if (this.search.length > 0) {
        console.log("text with filter");
        this.filterByText(tokens);
      } else this.filteredTokens = tokens;
    },
    filterByText(tokens) {
      this.filteredTokens = tokens.filter((token) => {
        return (
          token.symbol.toLowerCase().includes(this.search.toLowerCase()) ||
          token.contract.toLowerCase().includes(this.search.toLowerCase())
        );
      });
    },
  },
  async mounted() {
    console.log("mount start");
    const telosDChains = ["TELOS", "EOS"];
    var telosdTrx = telosDChains.includes(this.getFromChain.NETWORK_NAME) && telosDChains.includes(this.getToChain.NETWORK_NAME);
    // await this.updatePools();
    // await this.updateAllTokensBalances(this.accountName);
    if (this.antelope == null)
      this.antelope = false;
    console.log("Is Antelope:",this.antelope);
    if (this.antelope) {
      console.log("update chain");
      await this.updateCurrentChain(this.getFromChain.NETWORK_NAME);
      await this.$store.$api.setAPI(this.$store);
      await this.updateTPortTokens({contract:"bridge.start",chain:this.getToChain.NETWORK_NAME.toLowerCase()});
      if (telosdTrx) {
        await this.updateTelosDTokens();
      }
    }
    else {
      await this.updateTPortTokens();
    }
    if (!(["TELOS", "EOS", "WAX"].includes(this.getFromChain.NETWORK_NAME))) {
      await this.updateTportTokenBalancesEvm()
    }
    else {
      await this.updateTportTokenBalances();
      if (telosdTrx)
        await this.updateTelosDTokenBalances();
    }
    console.log("mount finish");
  },
};
</script>

<style lang="scss" scoped>
.dialogCard {
  flex: 0 1 350px;
  height: 80vh;
}

.greyItem {
  background: rgba($grey-4, 20%);
}

.addToken {
  //   color: $primary;
  text-decoration: underline;
  cursor: pointer;
}

.addBtn {
  color: white;
  background-image: linear-gradient(
    to right,
    $purpleBright 20%,
    $blueLight 80%
  );
  &:hover {
    background-image: linear-gradient(
      to left,
      $purpleBright 20%,
      $blueLight 80%
    );
  }
}
</style>
