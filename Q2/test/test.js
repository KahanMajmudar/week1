const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
	if (typeof o == "string" && /^[0-9]+$/.test(o)) {
		return BigInt(o);
	} else if (typeof o == "string" && /^0x[0-9a-fA-F]+$/.test(o)) {
		return BigInt(o);
	} else if (Array.isArray(o)) {
		return o.map(unstringifyBigInts);
	} else if (typeof o == "object") {
		if (o === null) return null;
		const res = {};
		const keys = Object.keys(o);
		keys.forEach((k) => {
			res[k] = unstringifyBigInts(o[k]);
		});
		return res;
	} else {
		return o;
	}
}

describe("HelloWorld", function () {
	let Verifier;
	let verifier;

	beforeEach(async function () {
		Verifier = await ethers.getContractFactory("HelloWorldVerifier");
		verifier = await Verifier.deploy();
		await verifier.deployed();
	});

	it("Should return true for correct proof", async function () {
		//[assignment] Add comments to explain what each line is doing

		// here we call the full prove function of the groth16 to create the proof
		// publicSignals contain the values of public inputs and outputs
		const { proof, publicSignals } = await groth16.fullProve(
			{ a: "1", b: "2" },
			"contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm",
			"contracts/circuits/HelloWorld/circuit_final.zkey"
		);

		// here we console the output of our circuit
		// only output is generated as it is by default public
		// and inputs are private by default
		console.log("1x2 =", publicSignals[0]);

		// this converts the publicSignals into BigNumber format
		const editedPublicSignals = unstringifyBigInts(publicSignals);
		// this converts the proof into BigNumber format
		const editedProof = unstringifyBigInts(proof);
		// this generates the calldata which is sent to the smart contract function as input proof
		// similiar to snarkjs generatecall
		const calldata = await groth16.exportSolidityCallData(
			editedProof,
			editedPublicSignals
		);

		// this converts the calldata into the input proof the smart contract function `verifyProof` is expecting
		const argv = calldata
			.replace(/["[\]\s]/g, "")
			.split(",")
			.map((x) => BigInt(x).toString());

		// prepare the input proof as needed by `verifyProof` function
		// uint[2] memory a
		// uint[2][2] memory b
		// uint[2] memory c
		// uint[1] memory input
		const a = [argv[0], argv[1]];
		const b = [
			[argv[2], argv[3]],
			[argv[4], argv[5]],
		];
		const c = [argv[6], argv[7]];
		const Input = argv.slice(8);

		// we expect the `verifyProof` to return true when supplied with correct inputs
		expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
	});
	it("Should return false for invalid proof", async function () {
		let a = [0, 0];
		let b = [
			[0, 0],
			[0, 0],
		];
		let c = [0, 0];
		let d = [0];
		expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
	});
});

describe("Multiplier3 with Groth16", function () {
	beforeEach(async function () {
		//[assignment] insert your script here
		Verifier = await ethers.getContractFactory("Multiplier3Verifier");
		verifier = await Verifier.deploy();
		await verifier.deployed();
	});

	it("Should return true for correct proof", async function () {
		//[assignment] insert your script here
		const { proof, publicSignals } = await groth16.fullProve(
			{ a: "1", b: "2", c: "3" },
			"contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm",
			"contracts/circuits/Multiplier3/circuit_final.zkey"
		);

		console.log("1x2x3 =", publicSignals[0]);

		const editedPublicSignals = unstringifyBigInts(publicSignals);
		const editedProof = unstringifyBigInts(proof);
		const calldata = await groth16.exportSolidityCallData(
			editedProof,
			editedPublicSignals
		);

		const argv = calldata
			.replace(/["[\]\s]/g, "")
			.split(",")
			.map((x) => BigInt(x).toString());

		const a = [argv[0], argv[1]];
		const b = [
			[argv[2], argv[3]],
			[argv[4], argv[5]],
		];
		const c = [argv[6], argv[7]];
		const Input = argv.slice(8);

		expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
	});
	it("Should return false for invalid proof", async function () {
		//[assignment] insert your script here
		let a = [0, 0];
		let b = [
			[0, 0],
			[0, 0],
		];
		let c = [0, 0];
		let d = [0];
		expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
	});
});

describe("Multiplier3 with PLONK", function () {
	beforeEach(async function () {
		//[assignment] insert your script here
		Verifier = await ethers.getContractFactory("PlonkVerifier");
		verifier = await Verifier.deploy();
		await verifier.deployed();
	});

	it("Should return true for correct proof", async function () {
		//[assignment] insert your script here
		const { proof, publicSignals } = await plonk.fullProve(
			{ a: "1", b: "2", c: "3" },
			"contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm",
			"contracts/circuits/Multiplier3_plonk/circuit_final.zkey"
		);

		console.log("1x2x3 =", publicSignals[0]);

		const editedPublicSignals = unstringifyBigInts(publicSignals);
		const editedProof = unstringifyBigInts(proof);
		const calldata = await plonk.exportSolidityCallData(
			editedProof,
			editedPublicSignals
		);

		const argv = calldata.split(",");

		expect(await verifier.verifyProof(argv[0], JSON.parse(argv[1]))).to.be.true;
	});
	it("Should return false for invalid proof", async function () {
		//[assignment] insert your script here
		let a = "0x00";
		let b = ["0"];
		expect(await verifier.verifyProof(a, b)).to.be.false;
	});
});
