const helpers = require("@nomicfoundation/hardhat-network-helpers");
import { ethers } from "hardhat";

const main = async () => {
  const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const ethHolder = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  await helpers.impersonateAccount(ethHolder);
  const impersonatedSigner = await ethers.getSigner(ethHolder);


  const amountUSDC = ethers.parseUnits("10000", 6);
//   const amountDAI = ethers.parseUnits("10000", 18);
//   const amountUSDCMin = ethers.parseUnits("9000", 6);
//   const amountDAIMin = ethers.parseUnits("9000", 18);
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  const USDC = await ethers.getContractAt(
    "IERC20",
    USDCAddress,
    impersonatedSigner,
  );
//   const DAI = await ethers.getContractAt(
//     "IERC20",
//     DAIAddress,
//     impersonatedSigner,
//   );
  const ROUTER = await ethers.getContractAt(
    "IUniswapV2Router",
    UNIRouter,
    impersonatedSigner,
  );

//   await USDC.approve(UNIRouter, amountUSDC);
//   await DAI.approve(UNIRouter, amountDAI);

  const ethBalBefore = await ethers.provider.getBalance(impersonatedSigner.address);
  const usdcBalBefore = await USDC.balanceOf(impersonatedSigner.address);
//   const daiBalBefore = await DAI.balanceOf(impersonatedSigner.address);
  console.log(
    "=================Before========================================",
  );

  console.log("USDC Balance before swapping:", ethers.formatUnits(usdcBalBefore, 6));
  console.log("ETHER Balance before swapping:", ethers.formatEther(ethBalBefore));

  const tx = await ROUTER.swapETHForExactTokens(
    amountUSDC,
    ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2","0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
    impersonatedSigner.address,
    deadline,
     { value: ethers.parseEther("10") }
  );
  await tx.wait();

  const usdcBalAfter = await USDC.balanceOf(impersonatedSigner.address);
  const ethBalAfter =  await ethers.provider.getBalance(impersonatedSigner.address);
  console.log("=================After========================================");
  console.log("USDC Balance after swapping:", ethers.formatUnits(usdcBalAfter, 6));
  console.log("Ether Balance after swapping:", ethers.formatEther(ethBalAfter));

  console.log("Swap completed successfully!");
  console.log("=========================================================");
  const usdcRecieved = usdcBalAfter - usdcBalBefore;
  const ethUsed = ethBalBefore - ethBalAfter;

  console.log("USDC RECEIVED:", ethers.formatUnits(usdcRecieved, 6));
  console.log("ETHER USED:", ethers.formatUnits(ethUsed, 18));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});