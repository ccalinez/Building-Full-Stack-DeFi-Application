const fs = require("fs");
const path = require("path");

// Define nombres
const contracts = {PairFactory : "PairFactory", AMMRouter : "AMMRouter", TokenA: "SimpleDeFiToken", TokenB : "SimpleDeFiToken"};
const network = "chain-31337";
const deploymentStatePath = path.resolve(__dirname, `../ignition/deployments/${network}/deployed_addresses.json`);
const deploymentState = JSON.parse(fs.readFileSync(deploymentStatePath, "utf8"));

for (let index in contracts) {
  let contractName = contracts[index];

  let address = deploymentState[`DEX#${index}`];
  if (!address) {
    throw new Error(`No se encontró el contrato ${index} en el estado de despliegue.`);
  }
  // Leer el ABI desde artifacts
  let artifactPath = path.resolve(__dirname, `../ignition/deployments/${network}/artifacts/DEX#${index}.json`);
  let artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  let abi = artifact.abi;
  let output = {
    address,
    abi
  };

  const outputDir = path.resolve(__dirname, `../src/frontend/contracts`);
  //fs.mkdirSync(outputDir, { recursive: true });

  let outputPath = path.join(outputDir, `${index}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
}


