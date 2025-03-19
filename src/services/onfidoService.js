import { init } from '@onfido/sdk';

class OnfidoService {
  constructor() {
    this.onfido = null;
    this.containerId = 'onfido-mount';
  }

  initialize(token, options = {}) {
    const defaultOptions = {
      token,
      containerId: this.containerId,
      onComplete: (data) => {
        console.log('Onfido verification completed:', data);
        if (options.onComplete) {
          options.onComplete(data);
        }
      },
      onError: (error) => {
        console.error('Onfido error:', error);
        if (options.onError) {
          options.onError(error);
        }
      },
      steps: [
        {
          type: 'welcome',
          options: {
            title: 'Identity Verification',
            description: 'Verify your identity to continue',
          },
        },
        {
          type: 'document',
          options: {
            documentTypes: {
              passport: true,
              driving_licence: true,
              national_identity_card: true,
            },
          },
        },
        { type: 'face', options: { requestedVariant: 'video' } },
      ],
    };

    // Merge default options with passed options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Initialize the Onfido SDK
    this.onfido = init(mergedOptions);
    
    return this;
  }

  start() {
    if (!this.onfido) {
      throw new Error('Onfido SDK not initialized');
    }
    
    this.onfido.open();
  }

  tearDown() {
    if (this.onfido) {
      this.onfido.tearDown();
      this.onfido = null;
    }
  }
}

export default new OnfidoService();