// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./interfaces/ITokenPair.sol";

contract TokenPair is ITokenPair, ERC20, ReentrancyGuard  {

    address public factory;
    address public tokenA;
    address public tokenB;
    uint256 public kLast;
    uint256 public constant MINIMUM_LIQUIDITY = 10**3;
    

    uint256 private reserveA;
    uint256 private reserveB;
    uint256 private blockTimestampLast;
    bytes4 private constant SELECTOR = bytes4(keccak256(bytes('transfer(address,uint256)')));

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

    function _safeTransfer(address token, address to, uint256 value) private {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(SELECTOR, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TRANSFER_FAILED');
    }

    function _setReserves(uint256 balance0, uint256 balance1) private {
        reserveA = balance0;
        reserveB = balance1;
        blockTimestampLast = block.timestamp;
        emit Sync(reserveA, reserveB);
    }



    function mint(address to) external nonReentrant override returns (uint256 liquidity) {
        (uint256 _reserveA, uint256 _reserveB,) = getReserves();
        uint256 balanceA = ERC20(tokenA).balanceOf(address(this));
        uint256 balanceB = ERC20(tokenB).balanceOf(address(this));
        uint256 amountA = balanceA - _reserveA;
        uint256 amountB = balanceB - _reserveB; 
        uint256 _totalSupply = totalSupply(); // gas savings,
        if (_totalSupply == 0) {
            liquidity = Math.sqrt(amountA * amountB) - MINIMUM_LIQUIDITY;
            _mint(address(0xdEaD), MINIMUM_LIQUIDITY); // permanently lock the first MINIMUM_LIQUIDITY tokens. 0xdEaD es la direccion de quemado ya que nadie tiene la clave privada de esa dirección.
        } else {
            liquidity = Math.min((amountA * _totalSupply) / _reserveA, (amountB * _totalSupply) / _reserveB);
        }
        require(liquidity > 0, 'INSUFFICIENT_LIQUIDITY_MINTED');
        _mint(to, liquidity);
        _setReserves(balanceA, balanceB);
        emit Mint(msg.sender, amountA, amountB);
    }

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