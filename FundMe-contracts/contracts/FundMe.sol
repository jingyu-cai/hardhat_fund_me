//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// Deployed to Goerli at 0x65df0e51C42BB23F6d6c857a03FA6C8Bf1bD5048

contract FundMe {
    // Event to emit when a Memo is created
    event NewMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string message
    );

    // Memo struct
    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    // List of all memos received from friends
    Memo[] memos;

    // Address of contract deployer
    address payable owner;

    // Deploy logic
    constructor() {
        owner = payable(msg.sender);
    }

    /**
     * @dev fund contract owner
     * @param _name name of the funder
     * @param _message a nice message from the funder
     */
     function fundMe(string memory _name, string memory _message) public payable {
        require(msg.value > 0, "Can't fund with 0 ETH");

        // Add the memo to blockchain storage
        memos.push(Memo(
            msg.sender,
            block.timestamp,
            _name,
            _message
        ));

        // Emit a log event when a new memo is created
        emit NewMemo(
            msg.sender,
            block.timestamp,
            _name,
            _message
        );
     }

    /**
     * @dev send entire balance stored in this contract to owner
     */
    function withdrawFunds() public {
        require(owner.send(address(this).balance));
    }

    /**
     * @dev retrieve all memos stored on the blockchain
     */
    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }

}
