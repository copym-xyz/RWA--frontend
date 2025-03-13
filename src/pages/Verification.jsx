import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    CheckCircle,
    Clock,
    AlertCircle,
    RefreshCw,
    Search
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useVerification } from '../hooks/useVerification.js';
import { useToast } from '../hooks/useToast';
const Verification = () => {
    const { isConnected, account } = useWallet();
    const {
        requestVerification,
        getPendingVerifications,
        getCompletedVerifications
    } = useVerification();
    const { toast } = useToast();
    const [pendingVerifications, setPendingVerifications] = useState([]);
    const [completedVerifications, setCompletedVerifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDID, setSelectedDID] = useState('');
    useEffect(() => {
        const fetchVerifications = async () => {
            if (!isConnected) return;
            setLoading(true);
            try {
                const pendingResults = await getPendingVerifications();
                const completedResults = await getCompletedVerifications();

                setPendingVerifications(pendingResults);
                setCompletedVerifications(completedResults);
            } catch (error) {
                toast({
                    title: 'Error Fetching Verifications',
                    description: error.message,
                    variant: 'destructive'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchVerifications();
    }, [isConnected]);
    const handleVerificationRequest = async () => {
        if (!selectedDID) {
            toast({
                title: 'Missing DID',
                description: 'Please enter a Decentralized Identifier (DID)',
                variant: 'warning'
            });
            return;
        }
        try {
            const result = await requestVerification(selectedDID);
            toast({
                title: 'Verification Requested',
                description: `Verification request submitted for ${selectedDID}`,
                variant: 'success'
            });
            // Refresh verifications
            setPendingVerifications(prev => [...prev, result]);
            setSelectedDID('');
        } catch (error) {
            toast({
                title: 'Verification Request Failed',
                description: error.message,
                variant: 'destructive'
            });
        }
    };
    const renderVerificationList = (verifications, type) => {
        if (verifications.length === 0) {
            return (
                <div className="text-center py-8 text-gray-500">
                    <RefreshCw className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                    <p>No {type} verifications found</p>
                </div>
            );
        }
        return (
            <div className="space-y-4">
                {verifications.map((verification, index) => (
                    <Card key={index} className="hover:bg-gray-50 transition-colors">
                        <CardContent className="flex justify-between items-center p-4">
                            <div>
                                <div className="flex items-center space-x-2">
                                    <span className="font-semibold">DID:</span>
                                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                        {verification.did}
                                    </code>
                                </div>
                                <div className="mt-2 flex items-center space-x-2">
                                    <span>Status:</span>
                                    <Badge
                                        variant={
                                            type === 'Pending' ? 'outline' :
                                                verification.status === 'completed' ? 'success' : 'destructive'
                                        }
                                    >
                                        {verification.status}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {type === 'Pending' ? (
                                    <Clock className="text-yellow-500" />
                                ) : verification.status === 'completed' ? (
                                    <CheckCircle className="text-green-500" />
                                ) : (
                                    <AlertCircle className="text-red-500" />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };
    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Identity Verification</h1>
            {!isConnected ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <AlertCircle className="h-16 w-16 text-yellow-500 mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Wallet Not Connected</h2>
                        <p className="text-gray-600 mb-4">
                            Please connect your wallet to manage verifications
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Request Verification</CardTitle>
                            <CardDescription>
                                Submit a verification request for your Decentralized Identifier
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex space-x-4">
                                <input
                                    type="text"
                                    placeholder="Enter your DID (Decentralized Identifier)"
                                    value={selectedDID}
                                    onChange={(e) => setSelectedDID(e.target.value)}
                                    className="flex-grow border rounded-md px-3 py-2"
                                />
                                <Button
                                    onClick={handleVerificationRequest}
                                    disabled={loading}
                                >
                                    <Search className="mr-2 h-4 w-4" /> Request Verification
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Verification History</CardTitle>
                            <CardDescription>
                                View your pending and completed verification requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="pending">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="pending">
                                        <Clock className="mr-2 h-4 w-4" /> Pending
                                    </TabsTrigger>
                                    <TabsTrigger value="completed">
                                        <CheckCircle className="mr-2 h-4 w-4" /> Completed
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="pending">
                                    {renderVerificationList(pendingVerifications, 'Pending')}
                                </TabsContent>
                                <TabsContent value="completed">
                                    {renderVerificationList(completedVerifications, 'Completed')}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
export default Verification;