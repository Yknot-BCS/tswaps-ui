<template>
  <q-card flat class="inputCard">
    <div class="row justify-between">
      <div class="text-subtitle1 text-weight-bold">Input</div>
      <div
        class="text-subtitle1"
        style="cursor: pointer"
        @click="updateValue2(balance)"
        v-if="isAuthenticated"
      >
        Balance: {{ balance }}
      </div>
    </div>
    <div class="row flex-wrap items-center">
      <input-amount
        class="col-xs-12 col-sm-6 col-md-6 q-mt-xs"
        :amount="getValue2"
        @update:amount="updateValue2($event)"
      />
      <div class="col-xs-12 col-sm-6 col-md-6 row justify-stretch q-mt-sm">
        <coin-selector class="col q-mr-sm" />
      </div>
    </div>
  </q-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import inputAmount from "src/components/InputAmount";
import coinSelector from "src/components/CoinSelector";
export default {
  components: { inputAmount, coinSelector },
  data() {
    return {};
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("liquidity", ["getValue1", "getValue2", "getToken2"]),
    ...mapGetters("tokens", ["getTokens"]),

    balance() {
      if (this.getTokens.find((token) => token.id === this.getToken2.id)) {
        return this.getToken2.amount;
      } else {
        return 0;
      }
    },
  },
  methods: {
    ...mapActions("liquidity", ["updateValue1", "updateValue2"]),
  },
};
</script>

<style lang="scss" scoped></style>
