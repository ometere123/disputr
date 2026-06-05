import { generateApiKey, hashApiKey } from "../backend/src/lib/crypto.js";

const key = generateApiKey("dk_test");

console.log("Developer API key created for local seeding:");
console.log(key);
console.log("SHA-256 hash for api_keys.key_hash:");
console.log(hashApiKey(key));
console.log("Plaintext is displayed once. Store it before closing this terminal.");
