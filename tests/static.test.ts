import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("repository security invariants", () => {
  it("keeps contract addresses environment-driven", () => {
    const config = readFileSync(join(root, "frontend", "config", "genlayer.ts"), "utf8");
    expect(config).toContain("NEXT_PUBLIC_DISPUTR_CONTRACT_ADDRESS");
    expect(config).not.toMatch(/0x[a-fA-F0-9]{40}/);
  });

  it("uses dk-prefixed API keys and SHA-256 hashing", () => {
    const crypto = readFileSync(join(root, "backend", "src", "lib", "crypto.ts"), "utf8");
    expect(crypto).toContain('startsWith("dk_")');
    expect(crypto).toContain('createHash("sha256")');
  });

  it("contracts are GenLayer Intelligent Contracts", () => {
    for (const file of ["disputr.py", "disputr_nft.py", "appeal_oracle.py"]) {
      const source = readFileSync(join(root, "intelligent-contracts", file), "utf8");
      expect(source).toContain("from genlayer import *");
      expect(source).toContain("class Contract(gl.Contract)");
      expect(source).toMatch(/@gl\.public\.(write|view)/);
    }
  });
});
