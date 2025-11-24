# Finance Tracker - AI Architecture Folder Structure

```
src/
  ai/                                    # AI module boundary - all AI logic isolated here
    engines/                             # AI engine implementations
      CloudAIEngine.ts                   # Cloud-based AI engine (OpenAI, Anthropic, etc.)
      LocalLLMEngine.ts                  # On-device LLM engine using TFLite models
      BaseAIEngine.ts                    # Abstract base class for all AI engines
      EngineFactory.ts                   # Factory for creating engine instances
      index.ts                           # Engine exports
      README.md                          # Engine architecture documentation
    
    model-loader/                        # Model loading and management
      TFLiteLoader.ts                    # TensorFlow Lite model loader
      ModelCache.ts                      # Model caching and lifecycle management
      ModelValidator.ts                  # Model integrity validation
      DecryptionLoader.ts                # Decrypted model loader wrapper
      index.ts                           # Model loader exports
      README.md                          # Model loading documentation
    
    extensions/                          # AI extension points (plugin architecture)
      CategoryManager.ts                 # Category management with strategy pattern
      InsightsManager.ts                 # Insights generation with registered sources
      QueryEngine.ts                     # Query processing with registered processors
      ExtensionRegistry.ts               # Central registry for all extensions
      index.ts                           # Extension exports
      README.md                          # Extension architecture documentation
    
    processors/                          # AI processors for specific tasks
      CategoryProcessor.ts                # Category classification processor
      TransactionProcessor.ts             # Transaction analysis processor
      InsightProcessor.ts                 # Insight generation processor
      QueryProcessor.ts                   # Natural language query processor
      index.ts                           # Processor exports
      README.md                          # Processor documentation
    
    utils/                               # AI utility functions
      PromptBuilder.ts                   # Prompt construction utilities
      ResponseParser.ts                  # AI response parsing utilities
      TokenCounter.ts                    # Token counting for cloud APIs
      ModelMetrics.ts                    # Model performance metrics
      index.ts                           # Utility exports
      README.md                          # Utility documentation
    
    types/                               # AI-related TypeScript types
      engine.types.ts                    # Engine interface types
      model.types.ts                     # Model-related types
      extension.types.ts                 # Extension point types
      processor.types.ts                 # Processor types
      index.ts                           # Type exports
    
    config/                              # AI configuration
      ai.config.ts                       # AI engine configuration
      model.config.ts                    # Model configuration
      index.ts                           # Config exports
    
    index.ts                             # Main AI module export
    
  security/                             # Security module (model encryption, keychain)
    encryption/                          # Encryption utilities
      AES256Encryption.ts                # AES-256 encryption implementation
      ModelEncryption.ts                 # Model-specific encryption wrapper
      KeyDerivation.ts                   # Key derivation functions
      index.ts                           # Encryption exports
      README.md                          # Encryption documentation
    
    keychain/                            # Keychain/key storage
      KeychainManager.ts                 # Keychain access wrapper
      KeyStorage.ts                      # Encryption key storage interface
      index.ts                           # Keychain exports
      README.md                          # Keychain documentation
    
    model-security/                      # Model security layer
      ModelDecryptor.ts                  # Model decryption service
      SecureModelStorage.ts              # Secure model storage manager
      TempFileManager.ts                 # Temporary decrypted file management
      index.ts                           # Model security exports
      README.md                          # Model security documentation
    
    index.ts                             # Security module export
    
  features/                             # Domain features (existing + AI integration points)
    auth/
      login/
        index.tsx                        # Login UI component
      registration/
        index.tsx                        # Registration UI component
    
    home/
      index.tsx                          # Home screen UI
      components/                        # Home-specific components
      hooks/                             # Home-specific hooks
      services/                          # Home business logic
    
    history/
      index.tsx                          # Transaction history UI
      components/                        # History-specific components
      hooks/                             # History-specific hooks
      services/                          # History business logic
    
    profile/
      index.tsx                          # Profile screen UI
      components/                        # Profile-specific components
      hooks/                             # Profile-specific hooks
      services/                          # Profile business logic
    
    transactions/                        # Transaction management feature
      index.tsx                          # Transaction list UI
      components/                        # Transaction components
      hooks/                             # Transaction hooks
      services/                          # Transaction business logic
      ai-integration.ts                  # AI integration point for transactions
    
    categories/                          # Category management feature
      index.tsx                          # Category management UI
      components/                        # Category components
      hooks/                             # Category hooks
      services/                          # Category business logic
      ai-integration.ts                  # AI integration point for categories
    
    insights/                            # AI insights feature
      index.tsx                          # Insights dashboard UI
      components/                        # Insight visualization components
      hooks/                             # Insights hooks
      services/                          # Insights business logic
      ai-integration.ts                  # AI integration point for insights
    
    chat/                                # AI chat assistant feature
      index.tsx                          # Chat interface UI
      components/                        # Chat components
      hooks/                             # Chat hooks
      services/                          # Chat business logic
      ai-integration.ts                  # AI integration point for chat
    
  shared/                               # Shared utilities and components
    navigation/                          # Navigation setup
      screens/
        index.tsx                        # Screen definitions
      homeTab/
        index.tsx                        # Home tab navigator
    
    components/                          # Reusable UI components
      Button.tsx                         # Button component
      Input.tsx                          # Input component
      Card.tsx                           # Card component
      index.ts                           # Component exports
    
    hooks/                               # Shared React hooks
      useAuth.ts                         # Authentication hook
      useTheme.ts                        # Theme hook
      index.ts                           # Hook exports
    
    services/                            # Shared business logic services
      api/                               # API client
        client.ts                        # API client setup
        endpoints.ts                     # API endpoints
        index.ts                         # API exports
      storage/                           # Storage services
        AsyncStorage.ts                  # AsyncStorage wrapper
        SecureStorage.ts                 # Secure storage wrapper
        index.ts                         # Storage exports
    
    utils/                               # Shared utilities
      formatters.ts                      # Data formatting utilities
      validators.ts                      # Validation utilities
      constants.ts                       # App constants
      index.ts                           # Utility exports
    
    types/                               # Shared TypeScript types
      common.types.ts                    # Common types
      api.types.ts                       # API types
      navigation.types.ts                # Navigation types
      index.ts                           # Type exports
    
    config/                              # App configuration
      app.config.ts                      # App configuration
      env.config.ts                      # Environment configuration
      index.ts                           # Config exports
    
  assets/                                # Static assets
    models_encrypted/                    # Encrypted model files (gitignored)
      .gitkeep                           # Keep directory in git
      README.md                          # Model storage instructions
    images/                              # Image assets
    fonts/                               # Font assets
    
  App.tsx                                # Root app component
  
  types/                                 # Global TypeScript types
    global.d.ts                          # Global type declarations
    
  constants/                             # App-wide constants
    routes.ts                            # Route constants
    colors.ts                            # Color constants
    index.ts                             # Constant exports
```

