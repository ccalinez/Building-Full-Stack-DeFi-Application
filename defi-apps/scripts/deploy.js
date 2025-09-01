const fs = require("fs");
const path = require("path");

// Define nombres
const contractName = "SimpleDeFiToken";
const network = "chain-11155111";

// Leer la dirección del contrato desde el estado de Ignition
const deploymentStatePath = path.resolve(__dirname, `../ignition/deployments/${network}/deployed_addresses.json`);
const deploymentState = JSON.parse(fs.readFileSync(deploymentStatePath, "utf8"));

const address = deploymentState[`SimpleDeFiTokenModule#${contractName}`];
if (!address) {
  throw new Error(`No se encontró el contrato ${contractName} en el estado de despliegue.`);
}


// Leer el ABI desde artifacts
const artifactPath = path.resolve(__dirname, `../src/backend/artifacts/src/backend/contracts/${contractName}.sol/${contractName}.json`);
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
const abi = artifact.abi;

// Guardar address + ABI en archivo JSON
const output = {
  address,
  abi
};

const outputDir = path.resolve(__dirname, `../src/frontend/contracts`);
fs.mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, `${contractName}.json`);
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`✅ ABI y dirección guardados en: ${outputPath}`);
