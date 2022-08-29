// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract WavePortal {
    uint256 totalWaves;
    uint256 private seed;
    mapping(address => uint256) public lastWavedAt;


    event NewWave(string waveName, address indexed from, uint256 timestamp, string message);

    struct Wave {
        string name;
        address waver;
        string message;
        uint256 timestamp;
    }

    Wave[] waves;

    constructor() payable {
        console.log("I AM SMART CONTRACT. POG.");
        seed = (block.timestamp + block.difficulty) % 100;
    }


    function wave(string memory _name, string memory _message) public {
        
        require(
            lastWavedAt[msg.sender] + 30 seconds < block.timestamp,
            "Wait for 30 sec please!"
        );
        lastWavedAt[msg.sender] = block.timestamp;
        
        totalWaves += 1;
        console.log("%s having address %s has waved a message %s!", _name, msg.sender, _message);
        waves.push(Wave(_name, msg.sender, _message, block.timestamp));
        
        seed = (block.difficulty + block.timestamp + seed) % 100;

        console.log("Random # generated: %d", seed);
        if (seed < 50) {
            console.log("%s won!", msg.sender);
                    uint256 prizeAmount = 0.0001 ether;
        require(
            prizeAmount <= address(this).balance,
            "Trying to withdraw more money than the contract has."
        );
        (bool success, ) = (msg.sender).call{value: prizeAmount}("");
        require(success, "Failed to withdraw money from contract.");
          
        }
        
        emit NewWave(_name, msg.sender, block.timestamp, _message);

    }

    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getTotalWaves() public view returns(uint256) {
        console.log("We have %d total waves!", totalWaves);
        return totalWaves;
    }
}