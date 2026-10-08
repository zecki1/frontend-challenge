export {};

declare global {
  interface Window {
    __mocks?: {
      getConfig(): Promise<unknown>;
      setScenario(name: string): Promise<unknown>;
      reset(): Promise<unknown>;
      emitNftPriceChange(nftId: string, factor?: number): Promise<unknown>;
      selloutNft(nftId: string): Promise<unknown>;
      updateOrder(orderId: string, status: string): Promise<unknown>;
    };
  }
}
