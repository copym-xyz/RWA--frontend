import React, { useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useIdentity } from '../../hooks/useIdentity';
import { useToast } from '../../hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const IdentityForm = () => {
  const { account, isConnected, connect } = useWallet();
  const { verifyIdentity, addChainIdentity, isLoading, error } = useIdentity();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    entityName: '',
    entityType: 'individual', // individual or organization
    did: '',
    vcData: {
      name: '',
      description: '',
      attributes: {}
    },
    targetChain: '',
    targetAddress: ''
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle VC data changes
  const handleVcDataChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      vcData: {
        ...prev.vcData,
        [name]: value
      }
    }));
  };

  // Handle entity type selection
  const handleEntityTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      entityType: value
    }));
  };

  // Handle chain selection
  const handleChainChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      targetChain: value
    }));
  };

  // Generate DID based on wallet address
  const generateDID = () => {
    if (!account) return;
    
    const did = `did:ethr:${account}`;
    setFormData((prev) => ({
      ...prev,
      did
    }));
  };

  // Submit identity verification
  const handleVerifyIdentity = async () => {
    if (!isConnected) {
      toast({
        title: "Not connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    try {
      // Prepare VC as JSON string
      const vc = JSON.stringify({
        ...formData.vcData,
        type: formData.entityType,
        issuanceDate: new Date().toISOString()
      });

      // Call verify identity function
      const result = await verifyIdentity({
        entityAddress: account,
        did: formData.did,
        vc
      });

      if (result.success) {
        toast({
          title: "Identity verified successfully",
          description: `Token ID: ${result.tokenId}`,
          variant: "default"
        });
      }
    } catch (err) {
      toast({
        title: "Verification failed",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  // Submit chain identity
  const handleAddChainIdentity = async () => {
    if (!isConnected) {
      toast({
        title: "Not connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get token ID from storage (in a real app, this would be retrieved from state or API)
      const tokenId = localStorage.getItem('tokenId');
      
      if (!tokenId) {
        toast({
          title: "Token ID not found",
          description: "Please verify your identity first",
          variant: "destructive"
        });
        return;
      }

      // Call add chain identity function
      const result = await addChainIdentity({
        tokenId,
        chainId: formData.targetChain,
        chainAddress: formData.targetAddress
      });

      if (result.success) {
        toast({
          title: "Chain identity added successfully",
          description: `Chain: ${result.chainId}`,
          variant: "default"
        });
      }
    } catch (err) {
      toast({
        title: "Failed to add chain identity",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Identity Management</CardTitle>
        <CardDescription>
          Verify your identity and manage cross-chain identities
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="verify">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="verify">Verify Identity</TabsTrigger>
            <TabsTrigger value="chain">Add Chain Identity</TabsTrigger>
          </TabsList>
          
          {/* Verify Identity Tab */}
          <TabsContent value="verify">
            <div className="space-y-4 mt-4">
              {/* Wallet Connection Status */}
              {!isConnected ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Not Connected</AlertTitle>
                  <AlertDescription>
                    Please connect your wallet to verify your identity.
                  </AlertDescription>
                  <Button onClick={connect} className="mt-2">Connect Wallet</Button>
                </Alert>
              ) : (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Connected</AlertTitle>
                  <AlertDescription>
                    Wallet address: {account}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Entity Type */}
              <div className="space-y-2">
                <Label htmlFor="entityType">Entity Type</Label>
                <Select 
                  value={formData.entityType}
                  onValueChange={handleEntityTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Entity Name */}
              <div className="space-y-2">
                <Label htmlFor="entityName">Entity Name</Label>
                <Input
                  id="entityName"
                  name="entityName"
                  value={formData.entityName}
                  onChange={handleInputChange}
                  placeholder="Enter entity name"
                />
              </div>
              
              {/* DID */}
              <div className="space-y-2">
                <Label htmlFor="did">Decentralized Identifier (DID)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="did"
                    name="did"
                    value={formData.did}
                    onChange={handleInputChange}
                    placeholder="did:ethr:0x..."
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={generateDID}
                    disabled={!isConnected}
                  >
                    Generate
                  </Button>
                </div>
              </div>
              
              {/* VC Data */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.vcData.name}
                  onChange={handleVcDataChange}
                  placeholder="Enter name for VC"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.vcData.description}
                  onChange={handleVcDataChange}
                  placeholder="Enter description for VC"
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Add Chain Identity Tab */}
          <TabsContent value="chain">
            <div className="space-y-4 mt-4">
              {/* Wallet Connection Status */}
              {!isConnected && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Not Connected</AlertTitle>
                  <AlertDescription>
                    Please connect your wallet to add chain identity.
                  </AlertDescription>
                  <Button onClick={connect} className="mt-2">Connect Wallet</Button>
                </Alert>
              )}
              
              {/* Target Chain */}
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
                  </SelectContent>
                </Select>
              </div>
              
              {/* Target Address */}
              <div className="space-y-2">
                <Label htmlFor="targetAddress">Target Address</Label>
                <Input
                  id="targetAddress"
                  name="targetAddress"
                  value={formData.targetAddress}
                  onChange={handleInputChange}
                  placeholder="Enter address on target chain"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Display error if any */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Tabs.Consumer>
          {({ value }) => (
            value === "verify" ? (
              <Button 
                onClick={handleVerifyIdentity} 
                disabled={isLoading || !isConnected}
              >
                {isLoading ? "Verifying..." : "Verify Identity"}
              </Button>
            ) : (
              <Button 
                onClick={handleAddChainIdentity} 
                disabled={isLoading || !isConnected}
              >
                {isLoading ? "Adding..." : "Add Chain Identity"}
              </Button>
            )
          )}
        </Tabs.Consumer>
      </CardFooter>
    </Card>
  );
};

export default IdentityForm;