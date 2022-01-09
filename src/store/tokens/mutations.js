export const setTokens = (state, { tokens }) => {
    state.tokens = tokens;
};


// Set token amount
export const setTokenAmount = (state, { token, amount }) => {
  let new_token = state.tokens.find(
    t =>
      t.symbol === token.symbol &&
      t.contract === token.contract &&
      t.chain === token.chain
  );
  if (new_token !== undefined) {
    new_token.amount = amount;
  } 
  state.tokens = state.tokens.sort((a, b) => (b.amount - a.amount))
};

export const clearTokens = (state) => {
  state.tokens = [];
} 
