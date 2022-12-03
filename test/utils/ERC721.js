const { expect } = require("chai");
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Mint a token for `to`
 */
const mint = async (token, to, uri) => {
    const tx = await token.safeMint(await to.getAddress(), uri);
    const receipt = await tx.wait();
    if (receipt && receipt.events && receipt.events.length === 1 && receipt.events[0].args) {
        return receipt.events[0].args.tokenId;
    } else {
        throw new Error("Unable to initialize bundle");
    }
};

/**
 * approve `amount` tokens for `to` from `from`
 */
const approve = async (
    token,
    sender,
    toAddress,
    tokenId,
) => {
    const senderAddress = await sender.getAddress();
    expect(await token.getApproved(tokenId)).to.not.equal(toAddress);

    await expect(token.connect(sender).approve(toAddress, tokenId))
        .to.emit(token, "Approval")
        .withArgs(senderAddress, toAddress, tokenId);

    expect(await token.getApproved(tokenId)).to.equal(toAddress);
};

module.exports = { ZERO_ADDRESS, mint, approve};