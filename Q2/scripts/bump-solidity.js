const fs = require("fs");
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/;

const verifierRegex = /contract Verifier/;

let content = fs.readFileSync("./contracts/HelloWorldVerifier.sol", {
	encoding: "utf-8",
});
let bumped = content.replace(solidityRegex, "pragma solidity ^0.8.0");
bumped = bumped.replace(verifierRegex, "contract HelloWorldVerifier");

fs.writeFileSync("./contracts/HelloWorldVerifier.sol", bumped);

// [assignment] add your own scripts below to modify the other verifier contracts you will build during the assignment
// 1. Multiplier3
let multiplier = fs.readFileSync("./contracts/Multiplier3Verifier.sol", {
	encoding: "utf-8",
});
let bumpedMultiplier = multiplier.replace(
	solidityRegex,
	"pragma solidity ^0.8.0"
);
bumpedMultiplier = bumpedMultiplier.replace(
	verifierRegex,
	"contract Multiplier3Verifier"
);

fs.writeFileSync("./contracts/Multiplier3Verifier.sol", bumpedMultiplier);
