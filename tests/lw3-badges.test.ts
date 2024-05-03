import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

// `simnet` is a "simulation network" - a local, testing Stacks node for running our tests
const accounts = simnet.getAccounts();

const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;

describe("LW3 Badges", () => {
  it("initializes properly", () => {
    const contractOwner = simnet.getDataVar("lw3-badges", "contract-owner");
    const lastTokenId = simnet.getDataVar("lw3-badges", "last-token-id");

    expect(contractOwner).toBePrincipal(deployer);
    expect(lastTokenId).toBeUint(0);
  });

  it("allows owner to mint a token", () => {
    const mint = simnet.callPublicFn(
      "lw3-badges",
      "mint",
      [Cl.principal(address1)],
      deployer
    );
    expect(mint.result).toBeOk(Cl.uint(1));

    const ownerOfToken1 = simnet.callReadOnlyFn(
      "lw3-badges",
      "get-owner",
      [Cl.uint(1)],
      address1
    );
    expect(ownerOfToken1.result).toBeOk(Cl.some(Cl.principal(address1)));
  });

  it("does not allow non-owner to mint a token", () => {
    const mint = simnet.callPublicFn(
      "lw3-badges",
      "mint",
      [Cl.principal(address1)],
      address1
    );
    expect(mint.result).toBeErr(Cl.uint(100));
  });

  it("allows owner to batch mint tokens", () => {
    const batchMint = simnet.callPublicFn(
      "lw3-badges",
      "batch-mint",
      [Cl.list([Cl.principal(address1), Cl.principal(address2)])],
      deployer
    );
    expect(batchMint.result).toBeOk(Cl.bool(true));

    const ownerOfToken1 = simnet.callReadOnlyFn(
      "lw3-badges",
      "get-owner",
      [Cl.uint(1)],
      address1
    );
    expect(ownerOfToken1.result).toBeOk(Cl.some(Cl.principal(address1)));

    const ownerOfToken2 = simnet.callReadOnlyFn(
      "lw3-badges",
      "get-owner",
      [Cl.uint(2)],
      address2
    );
    expect(ownerOfToken2.result).toBeOk(Cl.some(Cl.principal(address2)));
  });

  it("does not allow non-owner to batch mint tokens", () => {
    const batchMint = simnet.callPublicFn(
      "lw3-badges",
      "batch-mint",
      [Cl.list([Cl.principal(address1), Cl.principal(address2)])],
      address1
    );
    expect(batchMint.result).toBeErr(Cl.uint(100));
  });

  it("allows owner to set contract owner", () => {
    const setContractOwner = simnet.callPublicFn(
      "lw3-badges",
      "set-contract-owner",
      [Cl.principal(address1)],
      deployer
    );
    expect(setContractOwner.result).toBeOk(Cl.bool(true));

    const contractOwner = simnet.getDataVar("lw3-badges", "contract-owner");
    expect(contractOwner).toBePrincipal(address1);
  });

  it("does not allow non-owner to set contract owner", () => {
    const setContractOwner = simnet.callPublicFn(
      "lw3-badges",
      "set-contract-owner",
      [Cl.principal(address1)],
      address1
    );
    expect(setContractOwner.result).toBeErr(Cl.uint(100));
  });

  it("sets token uri correctly", () => {
    const tokenId = simnet.callPublicFn(
      "lw3-badges",
      "mint",
      [Cl.principal(address1)],
      deployer
    );
    expect(tokenId.result).toBeOk(Cl.uint(1));

    const tokenUri = simnet.callReadOnlyFn(
      "lw3-badges",
      "get-token-uri",
      [Cl.uint(1)],
      address1
    );
    expect(tokenUri.result).toBeOk(
      Cl.some(Cl.stringAscii("https://learnweb3.io/api/tokens/stx/1"))
    );
  });
});
