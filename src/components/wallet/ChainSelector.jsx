import React from 'react';
import { useSelector } from 'react-redux';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const ChainSelector = () => {
  const { chainId } = useSelector((state) => state.wallet);
  const { supportedChains } = useSelector((state) => state.chain);
  const { toast } = useToast();

  // Switch network function
  const switchNetwork = async (chainIdToSwitch) => {
    if (!window.ethereum) return;

    try {
      // Convert chainId to hex
      const chainIdHex = `0x${parseInt(chainIdToSwitch).toString(16)}`;

      // Request network switch
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (error) {
      // If the chain is not added to MetaMask
      if (error.code === 4902) {
        try {
          // Get chain data
          const chain = supportedChains[chainIdToSwitch];
          
          if (!chain) {
            throw new Error(`Chain with ID ${chainIdToSwitch} not found`);
          }

          // Add the network
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${parseInt(chainIdToSwitch).toString(16)}`,
                chainName: chain.name,
                rpcUrls: [chain.rpcUrl],
                blockExplorerUrls: [chain.explorer],
                nativeCurrency: {
                  name: chainIdToSwitch === '137' || chainIdToSwitch === '80001' || chainIdToSwitch === '80002' ? 'MATIC' : 'ETH',
                  symbol: chainIdToSwitch === '137' || chainIdToSwitch === '80001' || chainIdToSwitch === '80002' ? 'MATIC' : 'ETH',
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          toast({
            title: "Error adding network",
            description: addError.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Network switch failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Select
      value={chainId ? chainId.toString() : ''}
      onValueChange={(value) => switchNetwork(value)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select network" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(supportedChains).map(([id, chain]) => (
          <SelectItem key={id} value={id}>
            {chain.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ChainSelector;