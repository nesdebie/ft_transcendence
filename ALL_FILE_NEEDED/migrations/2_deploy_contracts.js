const PongMatches = artifacts.require("PongMatches");

module.exports = function (deployer) {
  deployer.deploy(PongMatches);
};