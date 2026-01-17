import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'

const MONAD_TESTNET_RPC = 'https://testnet-rpc.monad.xyz'
const CHAIN_ID = 10143
const SERVICE_ID = 'enterprise_batch_donate'
const DEFAULT_RECIPIENT = '0x0000000000000000000000000000000000000000'

function parseAmountWei(amountMon: number): bigint {
  return BigInt(Math.floor(amountMon * 1e18))
}

export async function POST(request: NextRequest) {
  try {
    const paymentId = request.headers.get('x-payment-id')
    const body = await request.json().catch(() => ({}))
    const donationsCount = Array.isArray(body?.donations) ? body.donations.length : 0

    // Pricing: 0.001 MON per donation (min 0.005 MON)
    const pricePerDonation = 0.001
    const basePrice = Math.max(donationsCount * pricePerDonation, 0.005)
    const amountWei = parseAmountWei(basePrice)

    const recipient = process.env.X402_PAYMENT_RECIPIENT || DEFAULT_RECIPIENT

    // If no payment id, return 402 payment requirement
    if (!paymentId) {
      return NextResponse.json(
        {
          error: 'Payment Required',
          payment: {
            serviceId: SERVICE_ID,
            price: `${basePrice.toFixed(4)} MON`,
            amountWei: amountWei.toString(),
            network: 'monad-testnet',
            chainId: CHAIN_ID,
            recipient,
          },
        },
        { status: 402 }
      )
    }

    // Verify payment on-chain
    const client = createPublicClient({
      transport: http(MONAD_TESTNET_RPC),
      chain: {
        id: CHAIN_ID,
        name: 'Monad Testnet',
        nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
        rpcUrls: { default: { http: [MONAD_TESTNET_RPC] } },
      },
    })

    const tx = await client.getTransaction({ hash: paymentId as `0x${string}` })
    const receipt = await client.getTransactionReceipt({ hash: paymentId as `0x${string}` })

    const isSuccess = receipt.status === 'success'
    const isRecipientMatch = (tx.to || '').toLowerCase() === recipient.toLowerCase()
    const isAmountEnough = tx.value >= amountWei

    if (!isSuccess || !isRecipientMatch || !isAmountEnough) {
      return NextResponse.json(
        {
          error: 'Invalid payment',
          details: {
            isSuccess,
            isRecipientMatch,
            isAmountEnough,
          },
        },
        { status: 402 }
      )
    }

    return NextResponse.json({
      ok: true,
      paymentId,
      serviceId: SERVICE_ID,
      verifiedAmountWei: tx.value.toString(),
    })
  } catch (error) {
    console.error('x402 verification error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
