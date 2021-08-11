import {
  HARDHAT_NETWORK_RESET_EVENT,
  HARDHAT_NETWORK_REVERT_SNAPSHOT_EVENT,
} from "hardhat/internal/constants";
import { EthereumProvider } from "hardhat/types";

import { EthersWebSocketProviderWrapper } from "./ethers-websocket-provider-wrapper";
import { createUpdatableTargetProxy } from "./updatable-target-proxy";

/**
 * This method returns a proxy that uses an underlying provider for everything.
 *
 * This underlying provider is replaced by a new one after a successful hardhat_reset,
 * because ethers providers can have internal state that returns wrong results after
 * the network is reset.
 */
export function createProviderProxy(
  hardhatProvider: EthereumProvider
): EthersWebSocketProviderWrapper {
  const initialProvider = new EthersWebSocketProviderWrapper(hardhatProvider);

  const { proxy: providerProxy, setTarget } = createUpdatableTargetProxy(
    initialProvider
  );

  hardhatProvider.on(HARDHAT_NETWORK_RESET_EVENT, () => {
    setTarget(new EthersWebSocketProviderWrapper(hardhatProvider));
  });
  hardhatProvider.on(HARDHAT_NETWORK_REVERT_SNAPSHOT_EVENT, () => {
    setTarget(new EthersWebSocketProviderWrapper(hardhatProvider));
  });

  return providerProxy;
}
