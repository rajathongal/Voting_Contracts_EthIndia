

const mintCoin = async (token, to, amount) => {
    await token.mint(to.getAddress(), amount)
};

module.exports = { mintCoin };
