// src/pages/Identity.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Fingerprint, AlertCircle, Shield, Plus } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useIdentity } from '../hooks/useIdentity';
import ChainIdentityManager from '@/components/identity/ChainIdentityManager';
import IdentityForm from '@/components/identity/IdentityForm';

const Identity = () => {
  const { isConnected, account } = useWallet();
  const { getTokenInfo } = useIdentity();
  const [identity, setIdentity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIdentity = async () => {
      if (!isConnected) return;
      
      // Check localStorage for token ID
      const storedTokenId = localStorage.getItem('tokenId');
      
      if (storedTokenId) {
        try {
          setLoading(true);
          const result = await getTokenInfo(storedTokenId);
          if (result.success) {
            setIdentity(result);
          }
        } catch (err) {
          console.error('Error fetching identity:', err);
          setError(err.message || 'Failed to load identity information');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchIdentity();
  }, [isConnected, getTokenInfo]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not verified';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Identity Management</h1>
      
      {!isConnected ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Connected</AlertTitle>
          <AlertDescription>
            Please connect your wallet to manage your identity.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left column - Identity overview */}
          <div className="md:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Fingerprint className="mr-2 h-5 w-5" /> Identity Overview
                </CardTitle>
                <CardDescription>
                  Your decentralized identity details
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading identity...</p>
                  </div>
                ) : identity ? (
                  <div className="space-y-4">
                    <div>
                      <Badge className="mb-2">Verified Identity</Badge>
                      <h3 className="text-lg font-medium">Token ID</h3>
                      <p className="text-sm font-mono bg-gray-100 p-2 rounded">{identity.token_id}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">DID</h3>
                      <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">{identity.did}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Wallet Address</h3>
                      <p className="text-sm font-mono bg-gray-100 p-2 rounded">{identity.address}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Verification Status</h3>
                      <p className="text-sm">{identity.status === 'verified' ? 
                        <Badge variant="success">Verified</Badge> : 
                        <Badge variant="outline">Pending</Badge>
                      }</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Verified At</h3>
                      <p className="text-sm">{formatDate(identity.verified_at)}</p>
                    </div>
                  </div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Identity Found</h3>
                    <p className="text-gray-500 mb-4">
                      You haven't created a Soulbound identity yet.
                    </p>
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" /> Create Identity
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Identity management */}
          <div className="md:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle>Identity Management</CardTitle>
                <CardDescription>
                  Create and manage your decentralized identity
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue={identity ? "chain" : "create"}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="create">Create Identity</TabsTrigger>
                    <TabsTrigger value="chain" disabled={!identity}>Chain Management</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="create">
                    <div className="py-4">
                      <IdentityForm existingIdentity={identity} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="chain">
                    <div className="py-4">
                      {identity ? (
                        <ChainIdentityManager identity={identity} />
                      ) : (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>No Identity</AlertTitle>
                          <AlertDescription>
                            Create an identity first to manage cross-chain identities.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Identity;