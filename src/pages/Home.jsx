import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BLOCKCHAIN_CONFIG } from '../config';

// Icons
import { 
  IdentificationIcon, 
  ShieldCheckIcon, 
  ArrowsRightLeftIcon,
  GlobeAltIcon,
  LockClosedIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { isAuthenticated } = useAuth();
  
  const features = [
    {
      name: 'Cross-Chain Identity',
      description: 'Create and manage a unified identity across multiple blockchains, including Ethereum and Solana.',
      icon: GlobeAltIcon,
    },
    {
      name: 'Soulbound NFTs',
      description: 'Secure your identity with non-transferable tokens that serve as on-chain proof of your verified credentials.',
      icon: IdentificationIcon,
    },
    {
      name: 'KYC/KYB Verification',
      description: 'Complete industry-standard verification processes for individuals and businesses.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Identity Bridging',
      description: 'Seamlessly bridge your identity between different blockchain networks with our cross-chain technology.',
      icon: ArrowsRightLeftIcon,
    },
    {
      name: 'Privacy-Preserving',
      description: 'Maintain control of your personal data with selective disclosure of identity information.',
      icon: LockClosedIcon,
    },
    {
      name: 'Integration Ready',
      description: 'Connect with other services and applications through our developer-friendly APIs and SDKs.',
      icon: ChartBarIcon,
    },
  ];
  
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gray-50 overflow-hidden">
        <div className="hidden sm:block sm:absolute sm:inset-y-0 sm:h-full sm:w-full">
          <div className="relative h-full max-w-screen-xl mx-auto">
            <svg
              className="absolute right-full transform translate-y-1/4 translate-x-1/4 lg:translate-x-1/2"
              width="404"
              height="784"
              fill="none"
              viewBox="0 0 404 784"
            >
              <defs>
                <pattern
                  id="f210dbf6-a58d-4871-961e-36d5016a0f49"
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="404" height="784" fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)" />
            </svg>
            <svg
              className="absolute left-full transform -translate-y-3/4 -translate-x-1/4 md:-translate-y-1/2 lg:-translate-x-1/2"
              width="404"
              height="784"
              fill="none"
              viewBox="0 0 404 784"
            >
              <defs>
                <pattern
                  id="5d0dd344-b041-4d26-bec4-8d33ea57ec9b"
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="404" height="784" fill="url(#5d0dd344-b041-4d26-bec4-8d33ea57ec9b)" />
            </svg>
          </div>
        </div>

        <div className="relative pt-6 pb-16 sm:pb-24">
          <main className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Multi-Chain Identity</span>
                <span className="block text-primary-600">Across Blockchains</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Create, verify, and manage your decentralized identity seamlessly across Ethereum, Solana, and beyond.
                Our platform enables secure cross-chain identity management and verification.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                {isAuthenticated ? (
                  <div className="rounded-md shadow">
                    <Link
                      to="/dashboard"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                    >
                      Go to Dashboard
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="rounded-md shadow">
                      <Link
                        to="/register"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                      >
                        Get Started
                      </Link>
                    </div>
                    <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                      <Link
                        to="/login"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                      >
                        Log In
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Supported Blockchains Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Cross-Chain</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Supported Blockchains
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform seamlessly integrates with multiple blockchain networks, allowing you to manage your identity across different ecosystems.
            </p>
          </div>

          <div className="mt-10">
            <div className="flex justify-center space-x-8 md:space-x-16">
              {Object.keys(BLOCKCHAIN_CONFIG).map((chain) => {
                const config = BLOCKCHAIN_CONFIG[chain];
                return (
                  <div key={chain} className="flex flex-col items-center">
                    <img
                      src={config.logo}
                      alt={config.name}
                      className="h-16 w-16"
                      onError={(e) => { e.target.src = '/images/placeholder-logo.svg' }}
                    />
                    <p className="mt-2 text-lg font-medium text-gray-900">{config.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to manage digital identity
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform provides everything you need to establish, verify, and utilize your decentralized identity across multiple blockchains.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div key={feature.name} className="bg-white rounded-lg shadow-md p-6 flex flex-col items-start h-full">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <feature.icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">{feature.name}</h3>
                  <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Process</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Get started with our platform in just a few simple steps.
            </p>
          </div>

          <div className="mt-10">
            <div className="relative">
              {/* Steps */}
              <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                <div className="relative">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <span className="text-lg font-bold">1</span>
                  </div>
                  <p className="mt-5 text-lg leading-6 font-medium text-gray-900">Create Your Account</p>
                  <p className="mt-2 text-base text-gray-500">
                    Sign up and connect your blockchain wallets to establish your cross-chain identity foundation.
                  </p>
                </div>

                <div className="mt-10 lg:mt-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <span className="text-lg font-bold">2</span>
                  </div>
                  <p className="mt-5 text-lg leading-6 font-medium text-gray-900">Verify Your Identity</p>
                  <p className="mt-2 text-base text-gray-500">
                    Complete the KYC/KYB verification process to receive your Soulbound NFT with verifiable credentials.
                  </p>
                </div>

                <div className="mt-10 lg:mt-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <span className="text-lg font-bold">3</span>
                  </div>
                  <p className="mt-5 text-lg leading-6 font-medium text-gray-900">Bridge Across Chains</p>
                  <p className="mt-2 text-base text-gray-500">
                    Extend your identity to other blockchains using our cross-chain bridge technology.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-primary-300">Create your cross-chain identity today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50"
              >
                Get Started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <a
                href="#"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-500"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;