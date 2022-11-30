<template>
  <div
    class="selectorContainer row items-center no-wrap"
    @click="showNetDialog = !showNetDialog"
  >
    <div class="imgWrapper row justify-center items-center">
      <token-avatar :token="selectedNetwork" :avatarSize="40" />
    </div>
    <div class="col ">
      <div v-if="isAuthenticated && isFrom" class="row text-subtitle2 q-mx-xs smallRow ellipsis">
        {{ selectedNetwork }}
      </div>
      <div v-if="isAuthenticated && isFrom" class="text-h6 q-mx-xs smallRow ellipsis">
        {{ selectedAccount }}
      </div>
      <div v-else class="text-h6 q-mx-xs smallRow ellipsis">
        {{ selectedNetwork }}
      </div>
    </div>
    <div class="col-md-auto row justify-end">
      <dropdown-btn />
    </div>
    <net-dialog :showNetDialog.sync="showNetDialog" :isFrom="isFrom" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import dropdownBtn from "src/components/DropdownBtn";
import tokenAvatar from "src/components/TokenAvatar";
import netDialog from "./NetDialog2";
export default {
  components: { dropdownBtn, tokenAvatar, netDialog },
  props: {
    isFrom: Boolean,
    selectedNetwork: String
  },
  data() {
    return {
      showNetDialog: false,
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("bridge", ["getFromChain", "getToChain"]),
    selectedAccount() {
      if (this.isFrom)
        return this.accountName;
      return "";
    }
  },
};
</script>

<style lang="scss" scoped>
.imgWrapper {
  border-radius: 100%;
  max-width: 3rem;
  max-height: 3rem;
}
.smallRow {
  line-height: 20px;
}
</style>
