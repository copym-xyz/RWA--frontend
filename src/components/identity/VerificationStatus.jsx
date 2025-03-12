import React, { useState, useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useIdentity } from '../../hooks/useIdentity';
import { useToast } from '../../hooks/useToast';
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
import { 
  Shield, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Clock,
  ArrowRightLeft
} from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Progress 
} from '@/components/ui/progress';
import { apiService } from '../../services/api.service';

const VerificationStatus = () => {
  const { isConnected, account, chainId } = useWallet();
  const { tokenId, requestCrossChainVerification, getTokenInfo, isLoading, error } = useIdentity();
  const { toast } = useToast();
  
  // State
  const [identity, setIdentity] = useState(null);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [formData, setFormData] = useState({
    targetChain: '',
  });

  // Load identity and verification requests
  useEffect(() => {
    const fetchData = async () => {
      // Check localStorage for token ID
      const storedTokenId = localStorage.getItem('tokenId');
      
      if (storedTokenId) {
        try {
          // Fetch identity
          const identityResult = await getTokenInfo(storedTokenId);
          if (identityResult.success) {
            setIdentity(identityResult);
            
            // Fetch verification requests
            setIsLoadingRequests(true);
            try {
              const requestsResponse = await apiService.get(`/verification/requests/${identityResult.did}`);
              if (requestsResponse.success) {
                setVerificationRequests(requestsResponse.data || []);
              }
            } catch (error) {
              console.error('Error fetching verification requests:', error);
            } finally {
              setIsLoadingRequests(false);
            }
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
      fetchData();
    }
  }, [isConnected, getTokenInfo, toast]);

  // Handle chain selection
  const handleChainChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      targetChain: value
    }));
  };

  // Submit verification request
  const handleRequestVerification = async () => {
    if (!isConnected) {
      toast({
        title: "Not connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    if (!identity) {
      toast({
        title: "No identity found",
        description: "Please create an identity first",
        variant: "destructive"
      });
      return;
    }

    // Validate form
    if (!formData.targetChain) {
      toast({
        title: "Validation error",
        description: "Please select a target chain",
        variant: "destructive"
      });
      return;
    }

    try {
      // Call cross-chain verification function
      const result = await requestCrossChainVerification({
        did: identity.did,
        targetChain: formData.targetChain
      });

      if (result.success) {
        toast({
          title: "Verification requested",
          description: `Successfully requested verification for ${getChainName(formData.targetChain)}`,
          variant: "default"
        });
        
        // Add the new request to state
        setVerificationRequests(prev => [
          {
            requestId: result.requestId,
            did: identity.did,
            sourceChain: getCurrentChainName(),
            targetChain: formData.targetChain,
            status: 'pending',
            timestamp: new Date().toISOString()
          },
          ...prev
        ]);
        
        // Reset form
        setFormData({
          targetChain: ''
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to request verification",
        variant: "destructive"
      });
    }
  };

  // Refresh verification requests
  const refreshRequests = async () => {
    if (!identity) return;
    
    setIsLoadingRequests(true);
    try {
      const response = await apiService.get(`/verification/requests/${identity.did}`);
      if (response.success) {
        setVerificationRequests(response.data || []);
        toast({
          title: "Refreshed",
          description: "Verification requests updated",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error refreshing verification requests:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to refresh verification requests",
        variant: "destructive"
      });
    } finally {
      setIsLoadingRequests(false);
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

  // Helper function to get current chain name
  const getCurrentChainName = () => {
    switch (chainId) {
      case 1:
        return 'eth-mainnet';
      case 5:
        return 'eth-goerli';
      case 11155111:
        return 'eth-sepolia';
      case 137:
        return 'polygon-mainnet';
      case 80001:
        return 'polygon-mumbai';
      default:
        return `chain-${chainId}`;
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Verified</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" /> Cross-Chain Verification
        </CardTitle>
        <CardDescription>
          Verify your identity across multiple blockchains
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!isConnected ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Connected</AlertTitle>
            <AlertDescription>
              Please connect your wallet to manage cross-chain verification.
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
            <Tabs defaultValue="requests">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="requests">Verification Requests</TabsTrigger>
                <TabsTrigger value="request">Request Verification</TabsTrigger>
              </TabsList>
              
              {/* Verification Requests Tab */}
              <TabsContent value="requests" className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Your Verification Requests</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshRequests}
                    disabled={isLoadingRequests}
                    className="flex items-center"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingRequests ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                
                {isLoadingRequests ? (
                  <div className="py-8">
                    <Progress value={80} className="w-full" />
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      Loading verification requests...
                    </p>
                  </div>
                ) : verificationRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request ID</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {verificationRequests.map((request, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {request.requestId.substring(0, 8)}...
                          </TableCell>
                          <TableCell>
                            {getChainName(request.sourceChain)}
                          </TableCell>
                          <TableCell>
                            {getChainName(request.targetChain)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell>
                            {formatDate(request.timestamp)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertTitle>No Verification Requests</AlertTitle>
                    <AlertDescription>
                      You haven't made any cross-chain verification requests yet.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
              
              {/* Request Verification Tab */}
              <TabsContent value="request" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <Alert>
                    <ArrowRightLeft className="h-4 w-4" />
                    <AlertTitle>Cross-Chain Verification</AlertTitle>
                    <AlertDescription>
                      Request verification of your identity on another blockchain. This will initiate a cross-chain verification process.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="sourceChain">Source Chain</Label>
                      <Input
                        id="sourceChain"
                        value={getChainName(getCurrentChainName())}
                        disabled
                      />
                    </div>
                    
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
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="did">Decentralized Identifier (DID)</Label>
                    <Input
                      id="did"
                      value={identity.did}
                      disabled
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
      
      <CardFooter>
        <Tabs.Consumer>
          {({ value }) => (
            value === "request" ? (
              <Button 
                onClick={handleRequestVerification} 
                disabled={!isConnected || !identity || isLoading || !formData.targetChain}
                className="ml-auto flex items-center"
              >
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                {isLoading ? "Requesting..." : "Request Verification"}
              </Button>
            ) : null
          )}
        </Tabs.Consumer>
      </CardFooter>
    </Card>
  );
};

export default VerificationStatus;