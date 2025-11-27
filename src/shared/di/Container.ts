/**
 * Simple Dependency Injection Container
 * Provides a centralized way to manage dependencies and their implementations
 */

type ServiceIdentifier = string | symbol;
type Factory<T> = () => T;
type ServiceDefinition<T> = {
  factory: Factory<T>;
  singleton?: boolean;
};

class DIContainer {
  private services = new Map<ServiceIdentifier, ServiceDefinition<any>>();
  private instances = new Map<ServiceIdentifier, any>();

  /**
   * Register a service with the container
   * @param identifier Unique identifier for the service (usually an interface name or symbol)
   * @param factory Function that creates an instance of the service
   * @param singleton If true, the same instance will be returned on each resolve
   */
  register<T>(
    identifier: ServiceIdentifier,
    factory: Factory<T>,
    singleton: boolean = true,
  ): void {
    this.services.set(identifier, { factory, singleton });
  }

  /**
   * Resolve a service from the container
   * @param identifier The service identifier
   * @returns An instance of the requested service
   */
  resolve<T>(identifier: ServiceIdentifier): T {
    const definition = this.services.get(identifier);

    if (!definition) {
      throw new Error(
        `Service with identifier ${String(identifier)} is not registered`,
      );
    }

    // If singleton and already instantiated, return the existing instance
    if (definition.singleton && this.instances.has(identifier)) {
      return this.instances.get(identifier) as T;
    }

    // Create new instance
    const instance = definition.factory();

    // If singleton, cache the instance
    if (definition.singleton) {
      this.instances.set(identifier, instance);
    }

    return instance as T;
  }

  /**
   * Check if a service is registered
   */
  isRegistered(identifier: ServiceIdentifier): boolean {
    return this.services.has(identifier);
  }

  /**
   * Clear all registered services and instances
   * Useful for testing
   */
  clear(): void {
    this.services.clear();
    this.instances.clear();
  }
}

// Export singleton instance
export const container = new DIContainer();

// Export service identifiers as symbols for type safety
export const ServiceIdentifiers = {
  FileService: Symbol('FileService'),
  ModelService: Symbol('ModelService'),
} as const;

