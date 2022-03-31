const ImmortlNFT = artifacts.require("ImmortlNFT");


module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(ImmortlNFT)
  console.log('ImmortlNFT: ', ImmortlNFT.address)
};
