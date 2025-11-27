import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

const CONTRACT_ADDRESSES = {
  creation: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CREATION as `0x${string}`,
  payment: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_PAYMENT as `0x${string}`,
};

export async function GET() {
  try {
    const client = createPublicClient({
      chain: sepolia,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL),
    });

    const results: any = {
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
      addresses: CONTRACT_ADDRESSES,
      tests: {},
    };

    // 测试 1: 检查合约代码是否存在
    const creationCode = await client.getBytecode({ 
      address: CONTRACT_ADDRESSES.creation 
    });
    results.tests.creationManager = {
      address: CONTRACT_ADDRESSES.creation,
      hasCode: creationCode && creationCode !== '0x',
      codeLength: creationCode?.length || 0,
    };

    const paymentCode = await client.getBytecode({ 
      address: CONTRACT_ADDRESSES.payment 
    });
    results.tests.paymentManager = {
      address: CONTRACT_ADDRESSES.payment,
      hasCode: paymentCode && paymentCode !== '0x',
      codeLength: paymentCode?.length || 0,
    };

    // 测试 2: 尝试读取 PaymentManager 的 balances
    try {
      const testAddress = '0x0000000000000000000000000000000000000001';
      const balance = await client.readContract({
        address: CONTRACT_ADDRESSES.payment,
        abi: [
          {
            type: 'function',
            name: 'balances',
            stateMutability: 'view',
            inputs: [{ name: 'creator', type: 'address' }],
            outputs: [{ type: 'uint256' }],
          },
        ],
        functionName: 'balances',
        args: [testAddress],
      });

      results.tests.balancesFunction = {
        success: true,
        testAddress,
        balance: balance.toString(),
      };
    } catch (error: any) {
      results.tests.balancesFunction = {
        success: false,
        error: error.message,
      };
    }

    // 测试 3: 尝试读取 CreationManager 的 nextWorkId
    try {
      const nextWorkId = await client.readContract({
        address: CONTRACT_ADDRESSES.creation,
        abi: [
          {
            type: 'function',
            name: 'nextWorkId',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ type: 'uint256' }],
          },
        ],
        functionName: 'nextWorkId',
      });

      results.tests.nextWorkIdFunction = {
        success: true,
        nextWorkId: nextWorkId.toString(),
      };
    } catch (error: any) {
      results.tests.nextWorkIdFunction = {
        success: false,
        error: error.message,
      };
    }

    // 测试 4: 检查 PaymentManager 的 creationManager 配置
    try {
      const creationManagerAddr = await client.readContract({
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

      results.tests.paymentManagerConfig = {
        success: true,
        creationManager: creationManagerAddr,
        isSet: creationManagerAddr !== '0x0000000000000000000000000000000000000000',
        matchesExpected: creationManagerAddr?.toLowerCase() === CONTRACT_ADDRESSES.creation.toLowerCase(),
      };
    } catch (error: any) {
      results.tests.paymentManagerConfig = {
        success: false,
        error: error.message,
      };
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
