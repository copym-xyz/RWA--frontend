import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import {
  useRequestVerificationMutation,
  useBridgeTokensMutation,
  useGetTokenTransferStatusQuery
} from '../features/bridge/bridgeApiSlice';
import {
  setTargetChain,
  setSourceChain,
  setSelectedToken,
  setAmount,
  addPendingTransaction
} from '../features/bridge/bridgeSlice';

const BridgePage = () => {
  const dispatch = useDispatch();
  const { targetChain, sourceChain, selectedToken, amount, pendingTransactions } = useSelector(state => state.bridge);
  const { did, sbtTokenId } = useSelector(state => state.identity);
  const { walletAddress } = useSelector(state => state.auth);
  
  const [step, setStep] = useState(1);
  const [availableTokens, setAvailableTokens] = useState([]);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transferId, setTransferId] = useState(null);
  
  // API mutations
  const [requestVerification, { isLoading: isVerifying }] = useRequestVerificationMutation();
  const [bridgeTokens, { isLoading: isBridging }] = useBridgeTokensMutation();
  
  // Query transfer status if we have a transferId
  const { data: transferStatus, isSuccess: transferStatusSuccess } = useGetTokenTransferStatusQuery(transferId, {
    skip: !transferId,
    pollingInterval: 5000, // Poll every 5 seconds
  });
  
  // Available chains
  const availableChains = [
    { id: 'polygon', name: 'Polygon' },
    { id: 'solana_devnet', name: 'Solana Devnet' }
  ];
  
  // Load available tokens for the source chain
  useEffect(() => {
    const loadTokens = async () => {
      if (sourceChain === 'polygon') {
        // In a real app, you'd fetch these from an API or blockchain
        setAvailableTokens([
          { symbol: 'GOLD', address: '0x8415b5f0ae583E8581673427C007c720Aa610706', name: 'Gold Token' },
          { symbol: 'OIL', address: '0x1111222233334444555566667777888899990000', name: 'Oil Token' }
        ]);
      } else if (sourceChain === 'solana_devnet') {
        setAvailableTokens([
          { symbol: 'GOLD', address: 'Gold11111111111111111111111111111111111111', name: 'Gold Token' }
        ]);
      }
    };
    
    if (sourceChain) {
      loadTokens();
    }
  }, [sourceChain]);
  
  // Load balance for selected token
  useEffect(() => {
    const loadBalance = async () => {
      if (!selectedToken || !walletAddress) return;
      
      try {
        if (sourceChain === 'polygon') {
          // For Polygon, we can use ethers.js
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const tokenContract = new ethers.Contract(
            selectedToken.address,
            ['function balanceOf(address) view returns (uint256)'],
            provider
          );
          
          const balance = await tokenContract.balanceOf(walletAddress);
          setTokenBalance(ethers.utils.formatUnits(balance, 18));
        } else {
          // For Solana, we'd use a different approach
          // This is a placeholder
          setTokenBalance('100.0');
        }
      } catch (error) {
        console.error('Error loading token balance:', error);
        setTokenBalance('0');
      }
    };
    
    if (selectedToken) {
      loadBalance();
    }
  }, [selectedToken, walletAddress, sourceChain]);
  
  // Update source chain based on current wallet
  useEffect(() => {
    if (window.ethereum) {
      dispatch(setSourceChain('polygon'));
    } else if (window.solana) {
      dispatch(setSourceChain('solana_devnet'));
    }
  }, [dispatch]);
  
  // Reset form when changing chains
  useEffect(() => {
    dispatch(setSelectedToken(null));
    dispatch(setAmount('0'));
  }, [sourceChain, targetChain, dispatch]);
  
  // Update status based on transfer status query
  useEffect(() => {
    if (transferStatusSuccess && transferStatus?.transfer) {
      if (transferStatus.transfer.completed) {
        setSuccess('Transfer completed successfully!');
        setStep(3); // Move to success step
      }
    }
  }, [transferStatusSuccess, transferStatus]);
  
  const handleSourceChainChange = (e) => {
    dispatch(setSourceChain(e.target.value));
    
    // Set target chain to the other chain
    if (e.target.value === 'polygon') {
      dispatch(setTargetChain('solana_devnet'));
    } else {
      dispatch(setTargetChain('polygon'));
    }
  };
  
  const handleTargetChainChange = (e) => {
    dispatch(setTargetChain(e.target.value));
  };
  
  const handleTokenSelect = (token) => {
    dispatch(setSelectedToken(token));
  };
  
  const handleAmountChange = (e) => {
    dispatch(setAmount(e.target.value));
  };
  
  const handleMaxAmount = () => {
    dispatch(setAmount(tokenBalance));
  };
  
  const handleVerifyIdentity = async () => {
    if (!did) {
      setError('You need a valid DID to use the bridge');
      return;
    }
    
    try {
      setError('');
      const response = await requestVerification({
        did,
        targetChain
      }).unwrap();
      
      if (response.success) {
        setStep(2); // Move to next step
      } else {
        setError(response.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Error verifying identity:', error);
      setError(error.message || 'Failed to verify identity');
    }
  };
  
  const handleBridgeTokens = async () => {
    if (!selectedToken || !amount || parseFloat(amount) <= 0) {
      setError('Please select a token and enter a valid amount');
      return;
    }
    
    try {
      setError('');
      const response = await bridgeTokens({
        tokenAddress: selectedToken.address,
        amount: ethers.utils.parseUnits(amount, 18).toString(),
        targetChain
      }).unwrap();
      
      if (response.success) {
        setTransferId(response.transferId);
        
        // Add to pending transactions
        dispatch(addPendingTransaction({
          id: response.transferId,
          type: 'BRIDGE',
          token: selectedToken.symbol,
          amount,
          sourceChain,
          targetChain,
          status: 'PENDING',
          timestamp: Date.now()
        }));
        
        setSuccess('Transfer initiated successfully!');
        setStep(3); // Move to success step
      } else {
        setError(response.message || 'Transfer failed');
      }
    } catch (error) {
      console.error('Error bridging tokens:', error);
      setError(error.message || 'Failed to bridge tokens');
    }
  };
  
  const renderStep1 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Identity Verification</h2>
      <p className="text-gray-600 mb-6">
        Before using the bridge, we need to verify your identity across chains.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Source Chain</label>
          <select
            value={sourceChain}
            onChange={handleSourceChainChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            disabled
          >
            {availableChains.map(chain => (
              <option key={chain.id} value={chain.id}>{chain.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Your current connected wallet chain</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Chain</label>
          <select
            value={targetChain}
            onChange={handleTargetChainChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          >
            {availableChains.filter(chain => chain.id !== sourceChain).map(chain => (
              <option key={chain.id} value={chain.id}>{chain.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">Identity Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">DID</p>
            <p className="font-mono text-sm break-all">{did || 'Not found'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">SBT Token ID</p>
            <p className="font-mono">{sbtTokenId || 'Not found'}</p>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleVerifyIdentity}
        disabled={isVerifying || !did}
        className={`w-full py-3 rounded-md ${
          !did
            ? 'bg-gray-300 cursor-not-allowed'
            : isVerifying
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
        } text-white font-semibold`}
      >
        {isVerifying ? 'Verifying...' : 'Verify Identity'}
      </button>
      
      {!did && (
        <p className="text-center text-red-600 text-sm mt-2">
          You need to create a DID first to use the bridge.
        </p>
      )}
    </div>
  );
  
  const renderStep2 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Select Tokens to Bridge</h2>
      <p className="text-gray-600 mb-6">
        Choose the token and amount you want to bridge from {sourceChain} to {targetChain}.
      </p>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Token</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableTokens.map(token => (
            <div
              key={token.symbol}
              onClick={() => handleTokenSelect(token)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedToken?.symbol === token.symbol
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                  {token.symbol.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{token.name}</p>
                  <p className="text-sm text-gray-600">{token.symbol}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {selectedToken && (
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <button
              onClick={handleMaxAmount}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Max: {tokenBalance} {selectedToken.symbol}
            </button>
          </div>
          <div className="flex">
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              placeholder="0.0"
              min="0"
              step="0.1"
              max={tokenBalance}
            />
            <div className="bg-gray-100 rounded-r-md border border-l-0 border-gray-300 px-3 flex items-center">
              {selectedToken.symbol}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex space-x-4">
        <button
          onClick={() => setStep(1)}
          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-md"
        >
          Back
        </button>
        
        <button
          onClick={handleBridgeTokens}
          disabled={isBridging || !selectedToken || !amount || parseFloat(amount) <= 0}
          className={`flex-1 py-3 rounded-md ${
            !selectedToken || !amount || parseFloat(amount) <= 0
              ? 'bg-gray-300 cursor-not-allowed'
              : isBridging
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-semibold`}
        >
          {isBridging ? 'Processing...' : 'Bridge Tokens'}
        </button>
      </div>
    </div>
  );
  
  const renderStep3 = () => (
    <div className="text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Transaction Submitted!</h2>
      <p className="text-gray-600 mb-6">
        Your bridge transaction is being processed and will be completed shortly.
      </p>
      
      {transferId && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 mx-auto max-w-md">
          <h3 className="font-semibold mb-2">Transaction Details</h3>
          <div className="space-y-2 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Transfer ID:</span>
              <span className="font-mono">{transferId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Token:</span>
              <span>{selectedToken?.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span>{amount} {selectedToken?.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">From:</span>
              <span>{sourceChain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">To:</span>
              <span>{targetChain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="text-green-600">Processing</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => {
            setStep(1);
            dispatch(setSelectedToken(null));
            dispatch(setAmount('0'));
            setTransferId(null);
            setSuccess('');
          }}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
        >
          Start New Bridge
        </button>
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Cross-Chain Bridge</h1>
        
        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                1
              </div>
              <span className="text-xs mt-1">Verify</span>
            </div>
            
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                2
              </div>
              <span className="text-xs mt-1">Select</span>
            </div>
            
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex flex-col items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                3
              </div>
              <span className="text-xs mt-1">Complete</span>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md mb-6">
            {success}
          </div>
        )}
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
      
      {/* Pending Transactions */}
      {pendingTransactions.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Pending Transactions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Transaction</th>
                  <th className="px-6 py-3">From</th>
                  <th className="px-6 py-3">To</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Time</th>
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm">{tx.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{tx.sourceChain}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{tx.targetChain}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{tx.amount} {tx.token}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        tx.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BridgePage;