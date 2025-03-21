// services/onfidoService.js

/**
 * Service for interacting with the Onfido SDK
 */
class OnfidoService {
  constructor() {
    this.instance = null;
    this.workflowRunId = null;
  }

  /**
   * Initialize the Onfido SDK
   * @param {string} token - The SDK token from the backend
   * @param {string} workflowRunId - The workflow run ID from the backend
   * @param {Object} options - SDK initialization options
   * @returns {Object} - The Onfido SDK instance
   */
  initialize(token, workflowRunId, options) {
    // Check if window.Onfido exists (should be loaded from HTML)
    if (!window.Onfido) {
      console.error('Onfido SDK not loaded. The script should be included in the HTML.');
      throw new Error('Onfido SDK not loaded - the script should be included in the HTML head');
    }
    
    if (this.instance) {
      console.warn('Onfido SDK already initialized. Tearing down previous instance.');
      this.tearDown();
    }

    try {
      console.log('Initializing Onfido SDK with token and options', { workflowRunId, containerId: options.containerId });
      
      // Save workflowRunId for future reference
      this.workflowRunId = workflowRunId;
      
      // Ensure options has default values
      const completeOptions = {
        ...options,
        useModal: options.useModal !== undefined ? options.useModal : false,
        isModalOpen: options.isModalOpen !== undefined ? options.isModalOpen : false,
        onModalRequestClose: options.onModalRequestClose || (() => {}),
      };
      
      // Check that we're using a specific version
      const sdkVersion = window.Onfido?.VERSION || 'unknown';
      console.log(`Using Onfido SDK version: ${sdkVersion}`);
      
      // Initialize Onfido with workflow
      this.instance = window.Onfido.init({
        token,
        workflowRunId,
        containerId: completeOptions.containerId,
        useModal: completeOptions.useModal,
        isModalOpen: completeOptions.isModalOpen,
        onModalRequestClose: completeOptions.onModalRequestClose,
        onComplete: (data) => {
          console.log('Onfido workflow completed');
          if (completeOptions.onComplete) {
            completeOptions.onComplete(data);
          }
        },
        onError: (error) => {
          console.error('Onfido SDK error:', error);
          if (completeOptions.onError) {
            completeOptions.onError(error);
          }
        }
      });
      
      console.log('Onfido SDK initialized successfully');
      return this.instance;
    } catch (error) {
      console.error('Error initializing Onfido SDK:', error);
      throw error;
    }
  }

  /**
   * Tear down the Onfido SDK instance
   */
  tearDown() {
    if (this.instance) {
      try {
        console.log('Tearing down Onfido SDK instance');
        this.instance.tearDown();
        this.instance = null;
        this.workflowRunId = null;
      } catch (error) {
        console.error('Error tearing down Onfido SDK:', error);
      }
    }
  }

  /**
   * Get the current Onfido instance
   * @returns {Object|null} - The current Onfido instance or null
   */
  getInstance() {
    return this.instance;
  }

  /**
   * Check if the SDK is currently initialized
   * @returns {boolean} - Whether the SDK is initialized
   */
  isInitialized() {
    return !!this.instance;
  }
}

// Create and export a singleton instance
const onfidoService = new OnfidoService();
export default onfidoService;