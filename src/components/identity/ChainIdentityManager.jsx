import React, { useState, useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useIdentity } from '../../hooks/useIdentity';
import { useToast } from '../../hooks/useToast.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Globe, AlertCircle, CheckCircle2, LinkIcon, PlusCircle, Trash2 } from 'lucide-react';

const ChainIdentityManager = () => {
  const { isConnected, account, chainId } = useWallet();
  const { tokenId, addChainIdentity, getTokenInfo, isLoading, error } = useIdentity();
  const { toast } = useToast();
  
  // State
  const [identity, setIdentity] = useState(null);
  const [chainIdentities, setChainIdentities] = useState([]);
  const [formData, setFormData] = useState({
    targetChain: '',
    targetAddress: ''
  });

  // Load identity and chain identities
  useEffect(() => {
    const fetchIdentity = async () => {
      // Check localStorage for token ID
      const storedTokenId = localStorage.getItem('tokenId');
      
      if (storedTokenId) {
        try {
          const result = await getTokenInfo(storedTokenId);
          if (result.success) {
            setIdentity(result);
            setChainIdentities(result.chainIdentities || []);
          }
        } catch (err) {
          console.error('Error fetching identity:', err);
          toast({
            title: "Error",
            description: err.message || "Failed to fetch identity information",
            variant: "destructive"
          });
        }
      }
    };

    if (isConnected) {
      fetchIdentity();
    }
  }, [isConnected, getTokenInfo, toast]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle chain selection
  const handleChainChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      targetChain: value
    }));
  };

  // Submit new chain identity
  const handleAddChainIdentity = async () => {
    if (!isConnected) {
      toast({
        title: "Not connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    if (!tokenId && !localStorage.getItem('tokenId')) {
      toast({
        title: "No identity found",
        description: "Please create an identity first",
        variant: "destructive"
      });
      return;
    }

    // Validate form
    if (!formData.targetChain || !formData.targetAddress) {
      toast({
        title: "Validation error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get token ID from state or localStorage
      const currentTokenId = tokenId || localStorage.getItem('tokenId');
      
      // Call add chain identity function
      const result = await addChainIdentity({
        tokenId: currentTokenId,
        chainId: formData.targetChain,
        chainAddress: formData.targetAddress
      });

      if (result.success) {
        toast({
          title: "Chain identity added",
          description: `Successfully added identity for ${getChainName(formData.targetChain)}`,
          variant: "default"
        });
        
        // Refresh identity data
        const updatedIdentity = await getTokenInfo(currentTokenId);
        if (updatedIdentity.success) {
          setIdentity(updatedIdentity);
          setChainIdentities(updatedIdentity.chainIdentities || []);
        }
        
        // Reset form
        setFormData({
          targetChain: '',
          targetAddress: ''
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to add chain identity",
        variant: "destructive"
      });
    }
  };

  // Helper function to get chain name
  const getChainName = (chainId) => {
    const chainMap = {
      'eth-mainnet': 'Ethereum Mainnet',
      'polygon-mainnet': 'Polygon Mainnet',
      'solana-mainnet': 'Solana Mainnet',
      'eth-goerli': 'Ethereum Goerli',
      'polygon-mumbai': 'Polygon Mumbai',
      'solana-devnet': 'Solana Devnet'
    };
    
    return chainMap[chainId] || chainId;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="mr-2 h-5 w-5" /> Chain Identity Manager
        </CardTitle>
        <CardDescription>
          Manage your identity across multiple blockchains
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!isConnected ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Connected</AlertTitle>
            <AlertDescription>
              Please connect your wallet to manage your chain identities.
            </AlertDescription>
          </Alert>
        ) : !identity ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Identity Found</AlertTitle>
            <AlertDescription>
              You need to create a Soulbound identity first.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Identity Summary */}
            <div className="space-y-2 mb-6">
              <h3 className="text-lg font-medium">Identity Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>DID</Label>
                  <div className="mt-1 text-sm text-muted-foreground truncate">
                    {identity.did}
                  </div>
                </div>
                <div>
                  <Label>Token ID</Label>
                  <div className="mt-1 text-sm">
                    {identity.tokenId}
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            {/* Chain Identities Table */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-medium">Your Chain Identities</h3>
              
              {chainIdentities.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Chain</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chainIdentities.map((identity, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {getChainName(identity.chainId)}
                        </TableCell>
                        <TableCell className="truncate max-w-[200px]">
                          {identity.chainAddress}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={identity.isVerified 
                              ? "bg-green-50 text-green-700" 
                              : "bg-yellow-50 text-yellow-700"}
                          >
                            {identity.isVerified ? 'Verified' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <LinkIcon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Chain Identities</AlertTitle>
                  <AlertDescription>
                    You haven't added any chain identities yet. Add your first one below.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <Separator className="my-6" />
            
            {/* Add New Chain Identity Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Add New Chain Identity</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="targetChain">Target Chain</Label>
                  <Select 
                    value={formData.targetChain}
                    onValueChange={handleChainChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target chain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eth-mainnet">Ethereum Mainnet</SelectItem>
                      <SelectItem value="polygon-mainnet">Polygon Mainnet</SelectItem>
                      <SelectItem value="solana-mainnet">Solana Mainnet</SelectItem>
                      <SelectItem value="eth-goerli">Ethereum Goerli</SelectItem>
                      <SelectItem value="polygon-mumbai">Polygon Mumbai</SelectItem>
                      <SelectItem value="solana-devnet">Solana Devnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetAddress">Address on Target Chain</Label>
                  <Input
                    id="targetAddress"
                    name="targetAddress"
                    value={formData.targetAddress}
                    onChange={handleInputChange}
                    placeholder="Enter address on target chain"
                  />
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Display error if any */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          disabled={!isConnected || !identity || isLoading}
        >
          Reset
        </Button>
        <Button 
          onClick={handleAddChainIdentity} 
          disabled={!isConnected || !identity || isLoading || !formData.targetChain || !formData.targetAddress}
          className="flex items-center"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {isLoading ? "Adding..." : "Add Chain Identity"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ChainIdentityManager;