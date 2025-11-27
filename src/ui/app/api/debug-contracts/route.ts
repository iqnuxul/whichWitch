import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

const CONTRACT_ADDRESSES = {
  creation: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CREATION as `0x${string}`,
  payment: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_PAYMENT as `0x${string}`,
  authorization: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_AUTHORIZATION as `0x${string}`,
};

export async function GET() {
  try {
    const client = createPublicClient({
      chain: sepolia,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL),
    });

    const results: any = {
      addresses: CONTRACT_ADDRESSES,
      checks: {},
    };

    // 检查每个合约是否存在
    for (const [name, address] of Object.entries(CONTRACT_ADDRESSES)) {
      try {
        const code = await client.getBytecode({ address });
        results.checks[name] = {
          address,
          exists: code && code !== '0x',
          codeLength: code ? code.length : 0,
        };
      } catch (error: any) {
        results.checks[name] = {
          address,
          error: error.message,
        };
      }
    }

    // 检查 PaymentManager 的 creationManager
    try {
      const creationManagerAddress = await client.readContract({
        address: CONTRACT_ADDRESSES.payment,
        abi: [
          {
            type: 'function',
            name: 'creationManager',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ type: 'address' }],
          },
        ],
        functionName: 'creationManager',
      });

      results.paymentManagerConfig = {
        creationManager: creationManagerAddress,
        isSet: creationManagerAddress !== '0x0000000000000000000000000000000000000000',
        matchesExpected: creationManagerAddress?.toLowerCase() === CONTRACT_ADDRESSES.creation.toLowerCase(),
      };
    } catch (error: any) {
      results.paymentManagerConfig = {
        error: error.message,
      };
    }

    // 检查 CreationManager 的 paymentManager
    try {
      const paymentManagerAddress = await client.readContract({
        address: CONTRACT_ADDRESSES.creation,
        abi: [
          {
            type: 'function',
            name: 'paymentManager',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ type: 'address' }],
          },
        ],
        functionName: 'paymentManager',
      });

      results.creationManagerConfig = {
        paymentManager: paymentManagerAddress,
        isSet: paymentManagerAddress !== '0x0000000000000000000000000000000000000000',
        matchesExpected: paymentManagerAddress?.toLowerCase() === CONTRACT_ADDRESSES.payment.toLowerCase(),
      };
    } catch (error: any) {
      results.creationManagerConfig = {
        error: error.message,
      };
    }

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
