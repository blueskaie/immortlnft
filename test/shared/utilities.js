const {
  BigNumber,
  bigNumberify,
} = require('ethers/utils')

const BASE_TEN = 10

function expandTo18Decimals(n) {
  return bigNumberify(n).mul(bigNumberify(10).pow(18))
}

// Defaults to e18 using amount * 10^18
function getBigNumber(amount, decimals = 18) {
  return new BigNumber(amount).mul(new BigNumber(BASE_TEN).pow(decimals))
}

module.exports = { expandTo18Decimals, getBigNumber }
