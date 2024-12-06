import { Address, Chain } from 'viem'
import { zksync, zkSyncSepoliaTestnet } from 'viem/chains'

export type MarketDataType = {
  market: Market
  chain: Chain
  addresses: {
    ZkImagine: Address
    ChestRewards?: Address
  }
}

export enum Market {
  test_zkSync = 'test_zkSync',
  zksync = 'zksync',
}

export const MarketConfig: {
  [key in keyof typeof Market]: MarketDataType
} = {
  test_zkSync: {
    market: Market.test_zkSync,
    chain: zkSyncSepoliaTestnet,
    addresses: {
      ZkImagine: '0xBC25a6EF4884A9FF0A8D7F637eb3441d62002F0b',
      ChestRewards: '0x32CAFbF04758B8152D7e4ACf40b1f6012Fc5C5E4',
    },
  },
  zksync: {
    market: Market.zksync,
    chain: zksync,
    addresses: {
      ZkImagine: '0x5c63369e3F04018A0C32559661E025F051fB071E',
      ChestRewards: '0x1379E87b0fFdD43839C298E5Af047D2ccbbFea6F', // ChestRewards: '0x4A9489B15f991cb1651C753feE6bc2e8ea26A038', TODO: update the contract for HEU rewards
    },
  },
}

// list all the chain in NetworkConfig
export const supportedChains: Chain[] = Object.values(MarketConfig).map(
  (market) => market.chain,
)
