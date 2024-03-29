<template>
  <q-dialog
    :value="showNetDialog"
    @input="$emit('update:showNetDialog', $event)"
    confirm
    class="dialogContainer"
  >
    <q-card class="dialogCard">
      <div class="dialogHeader">
        <div class="row justify-between items-center q-py-sm">
          <div header class="text-h6 q-pl-md">Select a network</div>
          <div class="q-pr-sm">
            <q-btn size="12px" flat dense round icon="clear" v-close-popup />
          </div>
        </div>
        <q-separator />
      </div>
      <q-list class="dialogList">
        <q-item
          v-for="net in chainOptions"
          :key="net.NETWORK_CHAIN_ID"
          clickable
          v-close-popup
          @click="updateSelectedNet(net)"
        >
          <q-item-section avatar>
            <token-avatar :token="net.NETWORK_NAME" :avatarSize="30" />
          </q-item-section>
          <q-item-section>
            {{ net.NETWORK_DISPLAY_NAME }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import tokenAvatar from "src/components/TokenAvatar";
import ual from "src/boot/ual_mixin";

export default {
  components: { tokenAvatar },
  mixins: [ual],
  props: ["showNetDialog", "isFrom"],
  computed: {
    ...mapGetters("blockchains", ["getAllPossibleChains", "getCurrentChain"]),
    ...mapGetters("bridge", ["getFromChain", "getToChain", "getToken"]),
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    selectedChain() {
      return this.isFrom ? this.getFromChain : this.getToChain;
    },
    chainOptions() {
      const choices = ["TELOS", "EOS", "WAX"];
      if (this.isFrom) {
        return this.getAllPossibleChains.filter((el)=>{
          return choices.includes(el.NETWORK_NAME) && this.getFromChain.NETWORK_NAME != el.NETWORK_NAME;
        });
      }
      else {
        return this.getAllPossibleChains.filter((el)=>{
          return choices.includes(el.NETWORK_NAME) && this.getFromChain.NETWORK_NAME != el.NETWORK_NAME && this.getToChain.NETWORK_NAME != el.NETWORK_NAME;
        });
      }
    },
  },
  methods: {
    ...mapActions("account", ["login", "logout", "autoLogin"]),
    ...mapActions("blockchains", ["updateCurrentChain"]),
    ...mapActions("bridge", ["updateFromChain", "updateToChain"]),

    async updateSelectedNet(chain) {
      if (
        this.isFrom &&
        this.getFromChain.NETWORK_NAME !== chain.NETWORK_NAME
      ) {
        if (this.isAuthenticated) {
          this.logout();
        }
        // this.updateToChain(this.getFromChain);
        this.updateFromChain(chain);
        this.updateCurrentChain(chain.NETWORK_NAME);
        if (this.getFromChain.NETWORK_NAME == this.getToChain.NETWORK_NAME) {
          const choices = ["TELOS", "EOS", "WAX"];
          var optionsLeft = this.getAllPossibleChains.filter((el)=>{
            return choices.includes(el.NETWORK_NAME) && this.getFromChain.NETWORK_NAME != el.NETWORK_NAME;
          });
          this.updateToChain(optionsLeft[0]);
        }
      } else if (
        !this.isFrom &&
        this.getToChain.NETWORK_NAME !== chain.NETWORK_NAME
      ) {
        this.updateToChain(chain);
      }
      this.$emit("update:showNetDialog", false);
    },
  },
  watch: {},
};
</script>

<style lang="scss" scoped>
.dialogCard {
  flex: 0 1 350px;
}
</style>
