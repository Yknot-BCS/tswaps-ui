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
            >Not seeing your token? Add it</q-item-label
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
          :key="`${token.chain}-${token.contract}-${token.symbol}`"
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
        <q-item v-if="getTokens.length == 0">No tokens found</q-item>
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
  props: ["showCoinDialog", "isFrom", "isSwap"],
  computed: {
    ...mapGetters("tokens", ["getTokens"]),
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    // ...mapGetters("swap", ["getFromToken", "getToToken"]),
    ...mapGetters("blockchains", ["getAllPossibleChains", "getCurrentChain"]),
    availableTokens() {
      if (this.filteredTokens.length > 0) {
        return this.filteredTokens;
      } else {
        return this.getTokens;
      }
    },
    // tokensForValidPair() {
    //   if (this.isSwap) {
    //     if (this.isFrom) return this.getToToken.toTokens;
    //     else return this.getFromToken.toTokens;
    //   } else {
    //     return [];
    //   }
    // }
  },
  methods: {
    ...mapActions("swap", ["updateSwapPool", "updateEstimate"]),
    ...mapActions("liquidity", ["updateActivePool"]),
    ...mapActions("pools", ["updatePools"]),
    ...mapActions("tokens", [
      "updateTokens",
      "updateTokenBalances",
      "updateAllTokensBalances",
      "updateAddNewToken",
      "updateRemoveToken",
    ]),
    updateSelectedCoin(token) {
      if (this.isSwap) {
        if (this.isFrom) {
          this.$store.commit("swap/setFromToken", token);
        } else {
          this.$store.commit("swap/setToToken", token);
        }
        this.updateSwapPool();
        this.updateEstimate();
      } else {
        if (this.isFrom) {
          this.$store.commit("liquidity/setToken1", token);
        } else {
          this.$store.commit("liquidity/setToken2", token);
        }
        this.updateActivePool();
      }

      let defaultToChain = {};
      if (token.toChain !== undefined) {
        defaultToChain = this.getAllPossibleChains.filter((el) =>
          token.toChain.map((c) => c.toUpperCase()).includes(el.NETWORK_NAME)
        )[0];
      } else {
        defaultToChain = this.getCurrentChain;
      }

      this.$store.commit("bridge/setToChain", defaultToChain);
    },

    filterTokens() {
      // TODO Show all when no input
      // console.log("Len: ", this.search.length);
      if (this.search.length > 0) {
        // console.log("text with filter");
        this.filterByText(this.getTokens);
      } else this.filteredTokens = this.getTokens;
    },
    filterByText(tokens) {
      this.filteredTokens = tokens.filter((token) => {
        return (
          token.symbol.toLowerCase().includes(this.search.toLowerCase()) ||
          token.contract.toLowerCase().includes(this.search.toLowerCase())
        );
      });
    },
    // Used in token list with :class="isValidToken(token) ? '' : 'greyItem'"
    // isValidToken(token) {
    //   const res = this.tokensForValidPair?.find(
    //     el =>
    //       el.symbol.toLowerCase().includes(token.symbol.toLowerCase()) &&
    //       el.contract.toLowerCase().includes(token.contract.toLowerCase())
    //   );
    //   return res !== undefined;
    // },
  },
  async mounted() {
    // await this.updatePools();
    // await this.updateAllTokensBalances(this.accountName);
    await this.updateTokens();
    await this.updateTokenBalances(this.accountName);
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
