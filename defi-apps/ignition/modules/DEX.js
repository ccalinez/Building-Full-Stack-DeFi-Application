const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const fs = require("fs");
const path = require("path");

const TokenModule = buildModule("DEX", (m) => {
  const tokenA = m.contract("SimpleDeFiToken", ["Token A", "TKA"],{ id: "TokenA"});
  const tokenB = m.contract("SimpleDeFiToken", ["Token B", "TKB"], { id: "TokenB"});
  const factory = m.contract("PairFactory", []);
  const router = m.contract("AMMRouter", [factory]);



  return { tokenA, tokenB, factory, router };
});

module.exports = TokenModule;

