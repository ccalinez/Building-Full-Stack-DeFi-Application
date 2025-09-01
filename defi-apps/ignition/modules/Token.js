const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const fs = require("fs");
const path = require("path");

const TokenModule = buildModule("SimpleDeFiTokenModule", (m) => {
  const token = m.contract("SimpleDeFiToken");

  return { token };
});

module.exports = TokenModule;

