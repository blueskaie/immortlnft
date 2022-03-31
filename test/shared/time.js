const {
  BigNumber,
} = require('ethers/utils')

// export async function advanceBlock(provider) {
//   return provider.send("evm_mine", [])
// }

// export async function advanceBlockTo(provider, blockNumber) {
//   for (let i = await provider.getBlockNumber(); i < blockNumber; i++) {
//     await advanceBlock(provider)
//   }
// }

// export async function advanceBlockWith(provider, blockCount) {
//   const currentBlockNumber = await provider.getBlockNumber()
//   const newBlockNumber = currentBlockNumber + blockCount
//   await advanceBlockTo(provider, newBlockNumber)
// }

// export async function increase(provider, value) {
//   await provider.send("evm_increaseTime", [value])
//   await advanceBlock(provider)
// }

// export async function latestBlock(provider) {
//   return provider.getBlock("latest")
//   //return new BigNumber(block.timestamp)
// }

async function latest(provider) {
  const block = await provider.getBlock("latest")
  return new BigNumber(block.timestamp)
}

// export const duration = {
//   seconds: function (val) {
//     return new BigNumber(val)
//   },
//   minutes: function (val) {
//     return new BigNumber(val).mul(this.seconds("60"))
//   },
//   hours: function (val) {
//     return new BigNumber(val).mul(this.minutes("60"))
//   },
//   days: function (val) {
//     return new BigNumber(val).mul(this.hours("24"))
//   },
//   weeks: function (val) {
//     return new BigNumber(val).mul(this.days("7"))
//   },
//   years: function (val) {
//     return new BigNumber(val).mul(this.days("365"))
//   },
// }

// export async function increaseTime(provider, duration) {
//   const id = Date.now()

//   await new Promise(async (resolve, reject) => {
//     ;(provider._web3Provider.sendAsync)(
//       { jsonrpc: '2.0', method: 'evm_increaseTime', params: [duration], id: id },
//       (err1) => {
//         console.log({err1})
//         if (err1) reject(err1)

//         ;(provider._web3Provider.sendAsync)(
//         { jsonrpc: '2.0', method: 'evm_mine', params: [], id: id + 1 },
//         (err2, res) => {
//           console.log({err2, res})
//           err2 ? reject(err2) : resolve(res)
//         })
//       }
//     )
//   })
// }

module.exports = { latest }