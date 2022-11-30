<template>
  <q-dialog
    :value="showTransaction"
    @input="$emit('update:showTransaction', $event)"
    confirm
    persistent
  >
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar
          icon="arrow_forward"
          color="primary"
          text-color="white"
          class="q-mr-sm"
        />
        <div class="text-h6 q-pa-sm">Transaction Sent</div>
      </q-card-section>
      <q-card-section>
        Transaction ID:
        <a
          :href="`${explorerUrl}${transaction}`"
          target="_blank"
          style="word-wrap: break-word"
        >
          {{ transaction }}
        </a>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn class="hover-accent" label="Ok" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: ["transaction", "showTransaction", "Testnet"],
  computed: {
    ...mapGetters("blockchains", ["getCurrentChain"]),
    explorerUrl() {
      /**
       * Telos
       * https://explorer.telos.net/transaction/8683046ccb1ce686ce6c305a3bd776bd2555be63f17ca6ad92d34102396849e6
       * telos test: 
       * https://explorer-test.telos.net/transaction/24d058d84d075fd1f3628260aa00ccf222b93a4f5075f43cd4979e97acb2f49e
       * eos test:
       * https://jungle3.bloks.io/transaction/3c4b6c44643e8616527d90d2b9ed7e20224909caa78e48bcde982232f8f4232f
       * eos:
       * https://bloks.io/transaction/2c704eb627113f5eeefcb3b9bbd81c5e7f0518ef678c6dbdcbaf59d9d15411bf
       * wax test:
       * https://wax-test.bloks.io/transaction/094d72ab527504b6af12c3fe8bb6f40d3c45a9c3d188a08cfd9092c0acc45a42
       * wax:
       * https://wax.bloks.io/transaction/578c8c743b716af2684d319d240e28beebcab788921d4b447aa2c25833109efc
       * telos evm test:
       * https://testnet.teloscan.io/tx/0x63edcaf3d72aa6a9c76bdfe266e9fb61a7edae4afb5c0a6ba6aa11a8877d4bac
       * telos evm:
       * https://www.teloscan.io/tx/0x60ca59460848e5acf1337aeb561ec6d1703e9c2129b439371442fd06f28a2682
       * bsc test:
       * https://testnet.bscscan.com/tx/0x2c48c2f227b46933feef1294cea0e3c10780cfd351601569915be3443bfa5b08
       * bsc:
       * https://bscscan.com/tx/0x9d73a06b8c353ed968d786644ac0f3aa3b0234fdd4d2ac8c39ba1e2ed3fee5bb
       * eth test:
       * https://goerli.etherscan.io/tx/0xaea6ac97664b813c340fdb1870767e32f6b0eadfb396c8714468e99529eb8fc1
       * eth:
       * https://etherscan.io/tx/0xc85f45d1d1e3df3ef8062187930d214099ba8957ff2be8c5498726b81d8b7705
       */
      if (["TELOS", "EOS", "WAX"].includes(this.getFromChain.NETWORK_NAME)){
        return `${this.getFromChain.NETWORK_EXPLORER}/transaction/`;
      } else {
        return `${this.getFromChain.NETWORK_EXPLORER}/tx/`;
      };
    },
    ...mapGetters("bridge", [
      "getFromChain",
    ]),
  },
  methods: {
    getTestnet() {
      return process.env.TESTNET;
    },
    checkEVM() {
      if (["TELOS","EOS","WAX"].includes(this.getFromChain.NETWORK_NAME)) {
        return false;
      } else {
        return true;
      }
    }
  },
};
</script>
