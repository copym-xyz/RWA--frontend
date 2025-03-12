import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useIdentity } from '../hooks/useIdentity';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronRight, 
  Wallet, 
  Shield, 
  Globe, 
  AlertCircle, 
  CheckCircle2,
  LinkIcon
} from 'lucide-react';
import IdentityForm from '../components/identity/IdentityForm';
import ChainIdentityManager from '../components/identity/ChainIdentityManager';
import VerificationStatus from '../components/identity/VerificationStatus';

const Dashboard = () => {
  const { isConnected, account, chainId, connect } = useWallet();
  const { tokenId, getTokenInfo, isLoading, error } = useIdentity();
  const [identity, setIdentity] = useState(null);

  // Load identity information if token ID exists
  useEffect(() => {
    const fetchIdentity = async () => {
      // Check localStorage for token ID
      const storedTokenId = localStorage.getItem('tokenId');
      
      if (storedTokenId) {
        try {
          const result = await getTokenInfo(storedTokenId);
          if (result.success) {
            setIdentity(result);
          }
        } catch (err) {
          console.error('Error fetching identity:', err);
        }
      }
    };

    if (isConnected) {
      fetchIdentity();
    }
  }, [isConnected, getTokenInfo]);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Multi-Chain Identity Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your decentralized identity across multiple blockchains
          </p>
        </div>

        <Separator />

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-3 space-y-4">
            {/* Wallet Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Wallet className="mr-2 h-5 w-5" /> Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isConnected ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Connected
                      </Badge>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Address:</span>
                      <span className="text-xs text-muted-foreground truncate mt-1">
                        {account}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Network:</span>
                      <span className="text-sm">
                        {chainId === 1 ? 'Ethereum Mainnet' : 
                         chainId === 5 ? 'Goerli Testnet' :
                         chainId === 11155111 ? 'Sepolia Testnet' :
                         chainId === 137 ? 'Polygon Mainnet' :
                         chainId === 80001 ? 'Mumbai Testnet' :
                         `Chain ID: ${chainId}`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      Connect your wallet to start
                    </p>
                    <Button onClick={connect} size="sm">
                      Connect Wallet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Identity Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Shield className="mr-2 h-5 w-5" /> Identity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {identity ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Verified
                      </Badge>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">DID:</span>
                      <span className="text-xs text-muted-foreground truncate mt-1">
                        {identity.did}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Token ID:</span>
                      <span className="text-xs mt-1">
                        {identity.tokenId}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      No identity verified yet
                    </p>
                    {isConnected && (
                      <Button variant="outline" size="sm" className="w-full">
                        Create Identity
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chain Identities */}
            {identity && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Globe className="mr-2 h-5 w-5" /> Chain Identities
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="px-4 py-2">
                    {identity.chainIdentities && identity.chainIdentities.length > 0 ? (
                      <ul className="space-y-2">
                        {identity.chainIdentities.map((ci, index) => (
                          <li key={index} className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                              <span>{ci.chainId === 'eth-mainnet' ? 'Ethereum' : 
                                     ci.chainId === 'polygon-mainnet' ? 'Polygon' :
                                     ci.chainId === 'solana-mainnet' ? 'Solana' :
                                     ci.chainId}
                              </span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={ci.isVerified 
                                ? "bg-green-50 text-green-700" 
                                : "bg-yellow-50 text-yellow-700"}
                            >
                              {ci.isVerified ? 'Verified' : 'Pending'}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground py-2">
                        No chain identities added yet
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="px-4 pt-0 pb-3">
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Chain Identities
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="md:col-span-9">
            {!isConnected ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <Wallet className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Connect your wallet to manage your decentralized identity across multiple blockchains.
                  </p>
                  <Button onClick={connect}>Connect Wallet</Button>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue={identity ? "manage" : "create"}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="create">Create Identity</TabsTrigger>
                  <TabsTrigger value="manage" disabled={!identity}>Manage Identity</TabsTrigger>
                  <TabsTrigger value="verify" disabled={!identity}>Cross-Chain Verification</TabsTrigger>
                </TabsList>
                
                <TabsContent value="create" className="pt-4">
                  <IdentityForm />
                </TabsContent>
                
                <TabsContent value="manage" className="pt-4">
                  <ChainIdentityManager />
                </TabsContent>
                
                <TabsContent value="verify" className="pt-4">
                  <VerificationStatus />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;