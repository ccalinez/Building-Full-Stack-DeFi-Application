// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./interfaces/ITokenPair.sol";

contract TokenPair is ITokenPair, ERC20 {

    address public factory;
    address public tokenA;
    address public tokenB;
    uint256 public kLast;

    uint256 private reserveA;
    uint256 private reserveB;
    uint256 private blockTimestampLast;

    constructor() ERC20("DEX Token Pair", "DEX-TP") {
        factory = msg.sender;
    }

    function initialize(address _tokenA, address _tokenB)
        external {
            require(msg.sender == factory, "NOT_FACTORY");
            tokenA = _tokenA;
            tokenB = _tokenB;
    }

    
    function getReserves() public view returns (
        uint256 _reserveA,
        uint256 _reserveB,
        uint256 _blockTimestampLast
        ) { 
        _reserveA = reserveA;
        _reserveB = reserveB;
        _blockTimestampLast = blockTimestampLast;
    }

    function _setReserves(uint256 balance0, uint256 balance1) private {
        reserveA = balance0;
        reserveB = balance1;
        blockTimestampLast = block.timestamp;
        emit Sync(reserveA, reserveB);
    }

    function mint(address to) external override returns (uint256 liquidity) {}

    function burn(
        address to
    ) external override returns (uint256 amountA, uint256 amountB) {}

    function swap(
        uint256 amountAOut,
        uint256 amountBOut,
        address to
    ) external override {}

    function skim(address to) external override {}

    function sync() external override {}

}