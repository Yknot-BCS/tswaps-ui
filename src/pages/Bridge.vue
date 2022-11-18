<template>
  <q-page>
    <section>
      <div class="row justify-center q-mt-xs padding-xxl">
        <div class="col-7">
          <div class="text-h4 text-center">
            Token Bridge
          </div>
        </div>
      </div>
      
        <div class="row items-center q-mt-xs q-mb-lg">
          <div class="col-5 text-right">Between Native and EVM chains</div>
          <q-toggle
            v-model="antelopeBridge"
            class="col-2 justify-center"
          />
          <div class="col-5 text-left">Between Antelope chains</div>
        </div>

      <div class="row justify-center q-mt-xs q-mb-lg">
        <bridge-stepper v-if="!antelopeBridge"/>
        <bridge-stepper2 v-else-if="antelopeBridge"/>
      </div>

      <div v-if="!antelopeBridge" class="row justify-center q-mt-lg q-mb-lg">
        <bridge-dashboard />
      </div>
    </section>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import metamask from "src/components/Metamask";
import bridgeStepper from "../components/bridge/bridgeStepper.vue";
import bridgeStepper2 from "../components/bridge/bridgeStepper2.vue";
import bridgeDashboard from "src/components/bridge/TeleportDash.vue";

export default {
  components: {
    bridgeStepper,
    bridgeStepper2,
    bridgeDashboard,
  },
  mixins: [metamask],
  data() {
    return {
      selectedTokenSym: "START",
      selectedNetwork: "ETHEREUM",
      antelopeBridge: false,
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
  },
};
</script>

<style lang="scss" scoped>
.q-card {
  &.not-authenticated {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    min-height: 100px;
  }
  &.authenticated {
    display: grid;
    align-items: stretch;
    grid-template-columns: 50px auto 50px;
    padding-bottom: 40px;
    & div {
      margin: 0;
      @media only screen and (max-width: 585px) {
        grid-column-start: 1;
        grid-column-end: 4;
      }
    }
  }
}
.header-bg {
  height: 160px;
  margin-bottom: -50px;
}
h2 {
  line-height: 45px;
  margin: 0 10px;
  font-size: 35px;
}

// .text-h4 {
//   color: white;
// } //commenting out fixes issues with dark/light mode
.padding-xxl {
  padding-bottom: 60px;
  padding-top: 60px;
}

.bridgeSwitch {
  width: 700px;
  max-width: 95vw;
  border-radius: 50px !important;
}

</style>
