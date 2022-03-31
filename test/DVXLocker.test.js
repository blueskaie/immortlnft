const { BigNumber } = require("@ethersproject/bignumber")
const { expandTo18Decimals } = require('./shared/utilities')
const ethers = require('ethers')
const { latest } = require('./shared/time')
const truffleAssert = require('truffle-assertions');

const DVXLocker = artifacts.require("DVXLocker")
const ERC20Mock = artifacts.require("ERC20Mock");
const helper = require("./truffleTestHelper");
const { assert } = require("chai");

contract("DVXLocker", async accounts => {
    let lpToken;
    const alice = accounts[0]
    const bob = accounts[1];
    const ronit = accounts[2];


    let dvxLockerInstance;;
    let tokenAddress;
    beforeEach(async function () {
        lpToken = await ERC20Mock.new("LPToken", "LP", expandTo18Decimals(1000000))
        tokenAddress = lpToken.address;
        dvxLockerInstance = await DVXLocker.deployed();
    });

    it("lock LP token with feeEnabled", async () => {

        const amount = expandTo18Decimals(100);
        const bnbFee = 101;//ethers.utils.parseEther("11.");
        //one hours lock.
        const releaseLockTime = parseInt((new Date()).getTime() / 1000) + 60 * 60;

        const aliceOriginalBalance = await lpToken.balanceOf(alice);

        await lpToken.approve(dvxLockerInstance.address, amount);
        const id = await dvxLockerInstance.lockTokens(tokenAddress, amount, releaseLockTime, { value: bnbFee });
        const depositId = id.logs[0].args.depositId.toString();

        await truffleAssert.reverts(
            dvxLockerInstance.withdrawTokens(depositId),
            "Tokens are locked"
        );

        const lpTokenBalance = await lpToken.balanceOf(dvxLockerInstance.address);
        assert.equal(lpTokenBalance.toString(), amount.toString());

        const totalBnbFees = (await dvxLockerInstance.totalBnbFees()).toString();
        assert.equal(totalBnbFees.toString(), bnbFee.toString());

        const walletTokenBalance = await dvxLockerInstance.walletTokenBalance(tokenAddress, alice);
        assert.equal(walletTokenBalance.toString(), amount.toString());

        const lockedToken = await dvxLockerInstance.lockedToken(depositId);
        assert.equal(lockedToken.tokenAmount.toString(), amount.toString());
    })
    it("multiple lock LP token with feeEnabled", async () => {
        const bnbFee = ethers.utils.parseEther("1.5");
        const amount = expandTo18Decimals(100);
        let amounts = [amount, amount, amount, amount];
        const releaseLockTime = parseInt((new Date()).getTime() / 1000) + 60 * 60;
        let releaseLockTimes = [releaseLockTime, releaseLockTime+1, releaseLockTime +2 , releaseLockTime + 3]; 
        //one hours lock.

        const aliceOriginalBalance = await lpToken.balanceOf(alice);
        await lpToken.approve(dvxLockerInstance.address, expandTo18Decimals(400));
        const id = await dvxLockerInstance.lockTokenMultiple(tokenAddress, amounts, releaseLockTimes, { value: bnbFee });
      
        // const depositId = id.logs[0].args.depositId.toString();

        // await truffleAssert.reverts(
        //     dvxLockerInstance.withdrawTokens(depositId),
        //     "Tokens are locked"
        // );

        const lpTokenBalance = await lpToken.balanceOf(dvxLockerInstance.address);
        assert.equal(lpTokenBalance.toString(), expandTo18Decimals(400));

        const totalBnbFees = (await dvxLockerInstance.totalBnbFees()).toString();
        assert.equal(totalBnbFees.toString(), bnbFee.toString());

        const walletTokenBalance = await dvxLockerInstance.walletTokenBalance(tokenAddress, alice);
        assert.equal(walletTokenBalance.toString(), expandTo18Decimals(400));
    })

    // it.only("lock LP token with fee disabled", async () => {
    //   const amount = expandTo18Decimals('0.7905694150420944');
    //   console.log(amount.toString(), "sdjbkjb");
    //   //one hours lock.
    //   const releaseLockTime = parseInt((new Date()).getTime() / 1000) + 60 * 60;
    //   await lpToken.approve(dvxLockerInstance.address, amount);
    //   const id = await dvxLockerInstance.lockTokens(tokenAddress, amount, releaseLockTime, false);
    //   const depositId = id.logs[0].args.depositId.toString();
    //   const lpTokenBalance = await lpToken.balanceOf(dvxLockerInstance.address);

    //   assert.equal(lpTokenBalance.toString(), amount.toString());


    //   const walletTokenBalance = await dvxLockerInstance.walletTokenBalance(tokenAddress, alice);
    //   assert.equal(walletTokenBalance.toString(), amount.toString());

    //   const lpFeePercent = parseInt(await dvxLockerInstance.lpFeePercent());
    //   const fee = amount * lpFeePercent / 1000;

    //   const lockedToken = await dvxLockerInstance.lockedToken(depositId);
    //   assert.equal(lockedToken.tokenAmount.toString(), amount - fee);

    // })



    it("withdraw token", async () => {
        const amount = expandTo18Decimals(100);
        const bnbFee = ethers.utils.parseEther("1.1");
        //one hours lock.
        const releaseLockTime = parseInt((new Date()).getTime() / 1000) + 60 * 60;

        await lpToken.approve(dvxLockerInstance.address, amount);
        const id = await dvxLockerInstance.lockTokens(tokenAddress, amount, releaseLockTime, { value: bnbFee });
        const depositId = id.logs[0].args.depositId.toString();

        const walletTokenPrevBalance = await dvxLockerInstance.walletTokenBalance(tokenAddress, alice);

        await helper.advanceTime(web3, 60 * 60);

        await dvxLockerInstance.withdrawTokens(depositId);

        await truffleAssert.reverts(
            dvxLockerInstance.withdrawTokens(depositId),
            "Tokens already withdrawn"
        );

        const { 0: tokenAddress_, 1: withdrawalAddress, 2: tokenAmount, 3: unlockTime, 4: withdraw } = await dvxLockerInstance.getDepositDetails(depositId);

        let aliceWithdrawBalance = (await lpToken.balanceOf(alice));
        assert.equal(aliceWithdrawBalance.toString(), expandTo18Decimals(1000000).toString());

        let walletTokenAfterunLockedBalance = await dvxLockerInstance.walletTokenBalance(tokenAddress, alice);
        assert.equal(walletTokenAfterunLockedBalance.toString(), 0);


    });

    it("Withdraw fees", async () => {
        let remainingBnbFees = await dvxLockerInstance.remainingBnbFees();
        let prev = await web3.eth.getBalance(ronit);
        await dvxLockerInstance.withdrawFees(ronit);
        let after = await web3.eth.getBalance(ronit);
        assert.equal(BigNumber.from(prev.toString()).add(BigNumber.from(remainingBnbFees.toString())).toString(), after);

    });

    it("Emergency withdraw", async ()=> {
        const amount = expandTo18Decimals(100);
        const bnbFee = ethers.utils.parseEther("1.1");
        //one hours lock.
        const releaseLockTime = parseInt((new Date()).getTime() / 1000) + 60 * 60;

        await lpToken.approve(dvxLockerInstance.address, amount);
        const id = await dvxLockerInstance.lockTokens(tokenAddress, amount, releaseLockTime, { value: bnbFee });
        const depositId = id.logs[0].args.depositId.toString();

  
        await dvxLockerInstance.emergencyWithdrawTokens(depositId,ronit);

        await truffleAssert.reverts(
            dvxLockerInstance.emergencyWithdrawTokens(depositId, ronit),
            "Tokens already withdrawn"
        );

        const { 0: tokenAddress_, 1: withdrawalAddress, 2: tokenAmount, 3: unlockTime, 4: withdraw } = await dvxLockerInstance.getDepositDetails(depositId);

        let ronitWithdrawBalance = (await lpToken.balanceOf(ronit));
        assert.equal(ronitWithdrawBalance.toString(), amount);

        let walletTokenAfterunLockedBalance = await dvxLockerInstance.walletTokenBalance(tokenAddress, alice);
        assert.equal(walletTokenAfterunLockedBalance.toString(), 0);


    })

    it.only("Withdraw specific token", async ()=> {
        await lpToken.transfer(dvxLockerInstance.address, expandTo18Decimals(10));
        let balance = lpToken.balanceOf(alice);
        assert(balance.toString(), expandTo18Decimals(999990).toString());
        await dvxLockerInstance.withdrawSpecificToken(lpToken.address, alice,expandTo18Decimals(10));
        balance = lpToken.balanceOf(alice);
        assert(balance.toString(), expandTo18Decimals(1000000).toString());
    });

    it("Renew token", async ()=> {
        const amount = expandTo18Decimals(100);
        const bnbFee = ethers.utils.parseEther("1.1");
        //one hours lock.
        const releaseLockTime = parseInt((new Date()).getTime() / 1000) + 60 * 60;

        await lpToken.approve(dvxLockerInstance.address, amount);
        const id = await dvxLockerInstance.lockTokens(tokenAddress, amount, releaseLockTime, { value: bnbFee });
        const depositId = id.logs[0].args.depositId.toString();
        
        //time travel
        await helper.advanceTime(web3, 60 * 60+1);
        
        //add 1 more hours
        await dvxLockerInstance.renewToken(depositId, releaseLockTime+60*60*2);

        await truffleAssert.reverts(
            dvxLockerInstance.withdrawTokens(depositId),
            "Tokens are locked"
        );

        await helper.advanceTime(web3, 60 * 60+1);

    });

})
