import { UAL } from "universal-authenticator-library";
import { KeycatAuthenticator } from "@telosnetwork/ual-telos-keycat";
import { Scatter } from "ual-scatter";
import { Wombat } from "ual-wombat";
import { Sqrl } from "@smontero/ual-sqrl";
import { Anchor } from "ual-anchor";
import { Wax } from "@eosdacio/ual-wax";

export default async ({ Vue, store }) => {
  if (localStorage.getItem("selectedChain") != null) {
    await store.dispatch(
      "blockchains/updateCurrentChain",
      localStorage.getItem("selectedChain")
    );
  } else {
    console.log("Set chain to telos");
    await store.dispatch("blockchains/updateCurrentChain", "TELOS");
  }
  const setupAuth = () => {
    let getCurrentChain = store.getters["blockchains/getCurrentChain"];
    // console.log(getCurrentChain.NETWORK_NAME);
    const chain = {
      chainId: getCurrentChain.NETWORK_CHAIN_ID,
      rpcEndpoints: [
        {
          protocol: getCurrentChain.NETWORK_PROTOCOL,
          host: getCurrentChain.NETWORK_HOST,
          port: getCurrentChain.NETWORK_PORT,
        },
      ],
    };
  
    let authenticators = [];
  
    // if telos network, include 'telos sign' as login option
    // if (getCurrentChain.NETWORK_NAME === 'TELOS') {
    //   authenticators = authenticators.concat([new KeycatAuthenticator([chain], { appName: process.env.APP_NAME })])
    // }
  
    // if wax network, include 'wax cloud wallet' as login option
    // if (getCurrentChain.NETWORK_NAME === "WAX") {
    //   authenticators = authenticators.concat([
    //     new Wax([chain], { appName: process.env.APP_NAME }),
    //   ]);
    // }
  
    authenticators = authenticators.concat([
      new Anchor([chain], { appName: process.env.APP_NAME }),
      new Wombat([chain], { appName: process.env.APP_NAME }),
    ]);
    const ual = new UAL([chain], "ual", authenticators);
    return ual;
  };

  store["$ual"] = setupAuth;
  Vue.prototype.$ual = setupAuth;
};
