// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./interfaces/ITokenPair.sol";
import "./interfaces/IPairFactory.sol";

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
        bool hasReward = _mintReward(_reserveA, _reserveB);
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
        if (hasReward) kLast = reserveA * reserveB;
        emit Mint(msg.sender, amountA, amountB);
    }

    function _mintReward(uint256 _reserveA, uint256 _reserveB)
        private
        returns (bool hasReward){
        address rewardTo = IPairFactory(factory).rewardTo();
        hasReward = rewardTo != address(0);
        uint256 _kLast = kLast; // gas savings
        if (hasReward) {
            if (_kLast != 0) {
                uint256 rootK = Math.sqrt(_reserveA * _reserveB);
                uint256 rootKLast = Math.sqrt(_kLast);
                if (rootK > rootKLast) {
                    uint256 liquidity = (totalSupply() * (rootK - rootKLast)) /
                        (rootKLast + rootK * 9);
                    if (liquidity > 0) _mint(rewardTo, liquidity);
                }
            }
        } else if (_kLast != 0) {
            kLast = 0;
        }
    }

     function burn(address to)
        external
        nonReentrant
        returns (uint256 amountA, uint256 amountB)
    {
        // Step 1: Calculate token amounts sent back to user
        (uint256 _reserveA, uint256 _reserveB, ) = getReserves();
        address _tokenA = tokenA;
        address _tokenB = tokenB;
        uint256 balance0 = IERC20(_tokenA).balanceOf(address(this));
        uint256 balance1 = IERC20(_tokenB).balanceOf(address(this));
        uint256 liquidity = balanceOf(address(this));

        bool hasReward = _mintReward(_reserveA, _reserveB);
        uint256 _totalSupply = totalSupply();
        amountA = (liquidity * balance0) / _totalSupply;
        amountB = (liquidity * balance1) / _totalSupply;
        require(amountA > 0 && amountB > 0, "INSUFFICIENT_BURNING_LIQUIDITY");

        // Step 2: Burn the LP tokens and send paired tokens
        _burn(address(this), liquidity);
        _safeTransfer(_tokenA, to, amountA);
        _safeTransfer(_tokenB, to, amountB);

        // Step 3: Set the reserves with token balances
        balance0 = IERC20(_tokenA).balanceOf(address(this));
        balance1 = IERC20(_tokenB).balanceOf(address(this));
        _setReserves(balance0, balance1);
        if (hasReward) kLast = reserveA * reserveB;
        emit Burn(msg.sender, amountA, amountB, to);
    }

    function swap(
        uint256 amountAOut,
        uint256 amountBOut,
        address to
    ) external override {}

    function skim(address to) external override {}

    function sync() external override {}

}