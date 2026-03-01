    const helpers = require("@nomicfoundation/hardhat-network-helpers");
import { ethers } from "hardhat";

const main = async () => {
  const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const ETHUSDCAddress = "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc";
  const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const holder = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  await helpers.impersonateAccount(holder);
  const impersonatedSigner = await ethers.getSigner(holder);

  const amountUSDC = ethers.parseUnits("10000", 6);
  const amountEther = ethers.parseEther("4");
  const amountUSDCMin = ethers.parseUnits("9000", 6);
  const amountETHMin = ethers.parseUnits("3.5");
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  const USDC = await ethers.getContractAt(
    "IERC20",
    USDCAddress,
    impersonatedSigner,
  );

  const ETHUSDC = await ethers.getContractAt(
    "IERC20",
    ETHUSDCAddress,
    impersonatedSigner,
  );
  const ROUTER = await ethers.getContractAt(
    "IUniswapV2Router",
    UNIRouter,
    impersonatedSigner,
  );

  await USDC.approve(UNIRouter, amountUSDC);

    const tx = await ROUTER.addLiquidityETH(
    USDCAddress,
    amountUSDC,
    amountUSDCMin,
    amountETHMin,
    impersonatedSigner.address,
    deadline,
    {value: amountEther}
  );
  await tx.wait();

  const liquidity = await ETHUSDC.balanceOf(impersonatedSigner.address);

  const usdcBalBefore = await USDC.balanceOf(impersonatedSigner.address);
  const ethBalBefore = await ethers.provider.getBalance(impersonatedSigner.address);
  console.log(
    "=================Before========================================",
  );

  console.log("USDC Balance before removing liquidity:", ethers.formatUnits(usdcBalBefore, 6));
  console.log("ETH Balance before removing liquidity:", ethers.formatUnits(ethBalBefore, 18));

  await ETHUSDC.approve(UNIRouter, liquidity);

    const tx2 = await ROUTER.removeLiquidityETH(
    USDCAddress,
    liquidity,
    amountUSDCMin,
    amountETHMin,
    impersonatedSigner.address,
    deadline
  );

  await tx2.wait();

  const usdcBalAfter = await USDC.balanceOf(impersonatedSigner.address);
  const ethBalAfter = await ethers.provider.getBalance(impersonatedSigner.address);
  console.log("=================After========================================");
  console.log("USDC Balance after removing liquidity:", ethers.formatUnits(usdcBalAfter, 6));
  console.log("ETH Balance after removing liquidity:", ethers.formatUnits(ethBalAfter, 18));

  console.log("Liquidity removed successfully!");
  console.log("=========================================================");
  const usdcReceived = usdcBalAfter - usdcBalBefore;
  const ethReceived = ethBalAfter - ethBalBefore;

  console.log("USDC RECEIVED:", ethers.formatUnits(usdcReceived, 6));
  console.log("ETH RECEIVED:", ethers.formatUnits(ethReceived, 18));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});