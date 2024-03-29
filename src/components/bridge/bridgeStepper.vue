<template>
  <div class="bridgeStepper">
    <q-stepper v-model="step" ref="stepper" alternative-labels flat bordered done-color="deep-purple-13"
      active-color="deep-purple-13" inactive-color="deep-purple-3" animated header-class="stepper-header"
      class="stepper-border">
      <q-step :name="1" title="Connect wallet" icon="fas fa-wallet" :done="step > 1">
        <div class="row">
          <div class="col-12 q-mb-sm">
            <div class="text-h5 q-mb-sm">Connect wallet</div>
          </div>

          <div class="inputCard col-12">
            <connect :isFrom="true" :isNative="this.isNative(true)" :selectedNetwork="this.getFromChain.NETWORK_NAME" />
          </div>

          <div class="row justify-center fit q-my-xs">
            <div class="cursor-pointer cardCircle" @click="switchNetworks">
              <i class="fas fa-arrow-down" />
            </div>
          </div>

          <div class="inputCard col-12">
            <connect :isFrom="false" :isNative="this.isNative(false)" :selectedNetwork="this.getToChain.NETWORK_NAME" />
          </div>
        </div>
      </q-step>

      <q-step :name="2" title="Transaction details" icon="fas fa-file-invoice-dollar" :done="step > 2">
        <div class="col-12 q-mb-sm">
          <div class="text-h5 q-mb-sm">Transaction details</div>
        </div>
        <div class="row q-px-lg q-pb-lg q-mb-sm bordered">
          <div class="col-sm-4 col-xs-12 text-h6 text-center text-bold small-padding">
            {{ "From " + getFromChain.NETWORK_NAME }}
          </div>
          <div class="col-sm-4 col-xs-12 text-h6 text-center text-bold">
            <token-avatar class="q-mx-sm" :token="getFromChain.NETWORK_NAME" :avatarSize="35" />

            <q-icon class="q-mx-sm fas fa-arrow-right"></q-icon>
            <token-avatar class="q-mx-sm" :token="getToChain.NETWORK_NAME" :avatarSize="35" />
          </div>
          <div class="col-sm-4 col-xs-12 text-h6 text-center text-bold small-padding">
            {{ "To " + getToChain.NETWORK_NAME }}
          </div>
        </div>
        <div class="row">
          <div class="col-12 q-mb-sm">
            <coin-selector />
          </div>

          <div class="col-12">
            <div class="row justify-between q-px-sm q-gutter-x-sm" v-if="getToken.contract !== ''">
              <div>
                {{ selectedNetwork }} balance: {{ getToken.amount.toString() }}
                {{ getToken.symbol }}
              </div>
              <div>Minimum: {{ getToken.min_quantity }}</div>
            </div>
            <amount-input :selectedTokenSym="getToken.symbol" :selectedToken="getToken" :amount="getAmount"
              @update:amount="updateAmount($event)" :balance="getToken.amount" :min="minSend" />
          </div>
        </div>
      </q-step>

      <q-step :name="3" title="Confirm" icon="fas fa-clipboard-check">
        <div class="text-h5 q-mb-sm">Confirm Transaction</div>
        <div class="row q-px-lg q-pb-lg bordered q-pb-md">
          <div class="col-sm-4 col-xs-12 text-h6 text-center text-bold small-padding">
            {{ "From " + getFromChain.NETWORK_NAME }}
          </div>
          <div class="col-sm-4 col-xs-12 text-h6 text-center text-bold">
            <token-avatar class="q-mx-sm" :token="getFromChain.NETWORK_NAME" :avatarSize="35" />

            <q-icon class="q-mx-sm fas fa-arrow-right"></q-icon>
            <token-avatar class="q-mx-sm" :token="getToChain.NETWORK_NAME" :avatarSize="35" />
          </div>
          <div class="col-sm-4 col-xs-12 text-h6 text-center text-bold small-padding">
            {{ "To " + getToChain.NETWORK_NAME }}
          </div>
          <div class="col-12 row items-center justify-center text-h6 text-bold q-mt-md">
            <token-avatar class="q-mx-sm" :token="getToken.symbol" :avatarSize="35" />
            {{ getAmount }} {{ getToken.symbol }}
          </div>
        </div>
        <div class="row q-pt-md">
          <div class="col-12 q-mb-sm">
            <div class="text-body1">
              Your transfer will start once you confirm the transaction.
            </div>
            <div class="text-body1">Transfers can take up to 24 hours.</div>
          </div>
        </div>
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation>
          <div class="row">
            <q-btn v-if="step > 1" flat color="white" @click="handlePrevious()" label="Previous"
              class="q-ml-sm bridgeButton nextButton" />
            <q-space />
            <q-btn @click="handleNext()" :label="step === 3 ? 'Confirm' : 'Next'" class="bridgeButton" />
          </div>
        </q-stepper-navigation>
      </template>
    </q-stepper>

    <send-tx-dialog :transaction="transaction" :showTransaction.sync="showTransaction" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import coinSelector from "./CoinSelector.vue";
import connect from "./Connect.vue";
import amountInput from "./AmountInput";
import sendTxDialog from "./SendTxDialog";
import tokenAvatar from "src/components/TokenAvatar.vue";

export default {
  components: {
    connect,
    coinSelector,
    amountInput,
    sendTxDialog,
    tokenAvatar,
  },
  data() {
    return {
      amount: null,
      showTransaction: false,
      transaction: null,
      remoteBalance: 0,
      step: 1,
      remoteContractInstance: null,
      selectedTokenSym: "START",
      selectedNetwork: "ETHEREUM",
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
    ...mapGetters("tport", [
      "getEvmNetworkList",
      "getTPortTokensBySym",
      "getTPortTokens",
      "getTeleports",
      "getEvmAccountName",
      "getEvmChainId",
      "getEvmNetwork",
      "getEvmRemoteId",
    ]),
    ...mapGetters("blockchains", [
      "getCurrentChain",
      "getNetworkByName",
      "getBridgeTokens",
      "getAllPossibleChains",
    ]),
    ...mapGetters("bridge", [
      "getToChain",
      "getFromChain",
      "getToken",
      "getAmount",
      "getToNative",
    ]),

    selectedToken() {
      return this.getToken.symbol;
    },

    avatar() {
      return this.selectedToken ? this.selectedToken.avatar : "";
    },

    balance() {
      return this.selectedToken ? this.selectedToken.balance : 0;
    },

    token_contract() {
      return this.selectedToken ? this.selectedToken.token_contract : null;
    },

    token_decimals() {
      return this.selectedToken ? this.selectedToken.decimals : null;
    },

    minSend() {
      const token = this.getTPortTokensBySym(this.selectedTokenSym);
      if (typeof token === "undefined") return 0;
      else return this.$chainToQty(token.min_quantity);
    },

    supportedEosChains() {
      const bridgeTokens = this.getBridgeTokens;
      if (bridgeTokens && this.selectedToken !== undefined) {
        let res = [this.getCurrentChain.NETWORK_NAME];
        for (let token of bridgeTokens) {
          if (
            this.$getSymFromAsset(token.token_info) === this.selectedTokenSym
          ) {
            res.push(token.channel.toUpperCase());
          }
        }
        return res;
      } else return [];
    },

    supportedEvmChains() {
      const token = this.getTPortTokensBySym(this.selectedTokenSym);
      if (token) {
        let res = [];
        for (let r of token.remote_contracts) {
          const network = this.getEvmNetworkList.find(
            (el) => el.remoteId === r.key
          );
          if (network) res.push(network.name.toUpperCase());
        }
        return res;
      } else return [];
    },

    networkOptions() {
      return [...this.supportedEosChains, ...this.supportedEvmChains];
    },

    tportTokens() {
      if (this.getTPortTokens.length === 0) return [];
      else return this.getTPortTokens.map((el) => el.token.sym);
    },
  },
  methods: {
    ...mapActions("account", ["reloadWallet", "setWalletBalances", "logout"]),
    ...mapActions("tport", [
      "updateTPortTokens",
      "updateTportTokenBalances",
      "updateWeb3",
      "updateTeleports",
      "updateTportTokenBalancesEvm",
    ]),
    ...mapActions("bridge", ["updateAmount", "sendBridgeToken", "updateToChain", "updateFromChain"]),
    ...mapActions("blockchains", ["updateCurrentChain"]),

    switchNetworks() {
      const tempHolder = this.getFromChain;
      this.$store.commit("bridge/setFromChain", this.getToChain);
      this.updateFromChain(this.getToChain);
      this.$store.commit("bridge/setToChain", tempHolder);
      this.updateToChain(tempHolder);
      this.updateTPortTokens();
    },

    formSubmitted() {
      // console.log("submit");
    },

    isNative(isFrom) {
      if (isFrom) return (
        this.getFromChain.NETWORK_NAME == "TELOS" ||
        this.getFromChain.NETWORK_NAME == "EOS" ||
        this.getFromChain.NETWORK_NAME == "WAX"
      );
      else return (
        this.getToChain.NETWORK_NAME == "TELOS" ||
        this.getToChain.NETWORK_NAME == "EOS" ||
        this.getToChain.NETWORK_NAME == "WAX"
      );
    },

    isWalletsConnected() {
      return (
        this.getEvmAccountName &&
        this.getEvmAccountName !== "" &&
        this.isAuthenticated
      );
    },

    isValidTransaction() {
      return (
        this.getToken.contract !== "" &&
        this.getAmount > 0 &&
        this.getAmount <= this.getToken.amount
      );
    },

    handleNext() {
      if (this.step === 1 && this.isWalletsConnected()) {
        this.updateTPortTokens();
        this.updateTeleports(this.accountName);
        !this.isNative(true)
          ? this.updateTportTokenBalancesEvm()
          : this.updateTportTokenBalances();
        this.$refs.stepper.next();
      } else if (this.step === 2 && this.isValidTransaction()) {
        this.$refs.stepper.next();
      } else if (this.step === 3) {
        this.send();
      }
    },

    handlePrevious() {
      if (this.step === 2) {
        this.$store.commit("bridge/resetToken");
        this.$refs.stepper.previous();
      }
      else {
        this.$refs.stepper.previous();
      }
    },

    async send() {
      try {
        this.transaction = await this.sendBridgeToken();
        if (this.transaction) {
          this.showTransaction = true;
          this.transaction = this.transaction.transactionId;
          this.to = null;
          this.amount = null;
          this.memo = "";
          this.step = 1;
          this.updateTeleports(this.accountName);
          this.$store.commit("bridge/resetToken");
          this.$q.notify({
            color: "green-4",
            textColor: "white",
            icon: "cloud_done",
            message: "Sent",
          });
        }
        else {
          this.$q.notify({
            color: "red",
            textColor: "white",
            icon: "error",
            message: "Error: Cancelled by user. Possibly not enough RAM",
          });
        }

      } catch (error) {
        console.error(this.transaction);
        this.$errorNotification(error);
      }
    },
    wrongNetwork(evmNetwork, selectedNetwork) {
      if (evmNetwork) {
        return (
          evmNetwork.name.toUpperCase() !==
          selectedNetwork.NETWORK_NAME.toUpperCase()
        );
      } else return true;
    },
  },
  mounted() {
    if (this.$route.query.token_sym !== undefined)
      this.selectedTokenSym = this.$route.query.token_sym;
    this.selectedNetwork = this.getCurrentChain.NETWORK_NAME;
    this.reloadWallet(this.accountName);
    var exclude = ["EOS", "WAX"];
    var options = this.getAllPossibleChains.filter((chain) => !exclude.includes(chain.NETWORK_NAME));
    if (this.getFromChain.NETWORK_NAME != options[0].NETWORK_NAME && this.isAuthenticated)
      this.logout();
    this.updateFromChain(options[0]);
    this.updateCurrentChain(options[0].NETWORK_NAME);
    this.$store.$api.setAPI(this.$store);
    this.updateToChain(options[1]);
    this.$store.commit("bridge/resetToken");
    this.updateTPortTokens();
  },

  watch: {
    async accountName() {
      this.reloadWallet(this.accountName);
      this.updateTeleports(this.accountName);
    },
    async selectedNetwork() {
      if (this.supportedEvmChains.includes(this.selectedNetwork)) {
        this.connectWeb3();
        this.switchMetamaskNetwork(this.selectedNetwork);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.bridgeStepper {
  width: 700px;
  max-width: 95vw;
  border-radius: 50px !important;
}

.bridgeButton {
  color: white;
  background-color: rgb(85, 42, 248);
}

.bordered {
  border: 2px solid $primary;
  border-radius: 15px;
  padding: 5px;
  //background: rgb(227,223,247) !important;
}

.small-padding {
  padding-top: 4px;
}

.stepper-border {
  border-radius: 30px;
}
</style>
