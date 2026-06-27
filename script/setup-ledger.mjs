// scripts/setup-ledger.mjs
import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0gfoundation/0g-compute-ts-sdk";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PROVIDER_ADDRESS = "0xa48f01287233509FD694a22Bf840225062E67836";

if (!PRIVATE_KEY) {
  console.error("Set PRIVATE_KEY env var first");
  process.exit(1);
}

const rpcProvider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
const wallet = new ethers.Wallet(PRIVATE_KEY, rpcProvider);

console.log("Wallet:", wallet.address);
const balance = await rpcProvider.getBalance(wallet.address);
console.log("Balance:", ethers.formatEther(balance), "OG");

if (balance < ethers.parseEther("4")) {
  console.error("Need at least 4 OG — go to faucet.0g.ai first");
  process.exit(1);
}

const broker = await createZGComputeNetworkBroker(wallet);

// Step 1: Create the ledger with 3 OG (minimum requirement)
console.log("\n[1/3] Creating ledger with 3 OG...");
await broker.ledger.addLedger(3);
console.log("✓ Ledger created");

// Step 2: Acknowledge the provider's TEE signer (one-time per provider)
console.log("\n[2/3] Acknowledging provider TEE signer...");
await broker.inference.acknowledgeProviderSigner(PROVIDER_ADDRESS);
console.log("✓ Provider acknowledged");

// Step 3: Transfer 1 OG to the provider for inference
console.log("\n[3/3] Transferring 1 OG to provider...");
await broker.ledger.transferFund(
  PROVIDER_ADDRESS,
  "inference",
  ethers.parseEther("1.0")
);
console.log("✓ Funds transferred");

console.log("\n✅ Setup complete. Re-run your curl test now.");