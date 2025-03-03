import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyMessage } from 'ethers/lib/utils';

export async function middleware(request: NextRequest) {
    // Skip middleware for non-API routes
    if (!request.url.includes('/api/')) {
        return NextResponse.next();
    }

    const signature = request.headers.get('x-signature');
    const address = request.headers.get('x-address');
    const timestamp = request.headers.get('x-timestamp');

    if (!signature || !address || !timestamp) {
        return new NextResponse(
            JSON.stringify({ error: 'Missing authentication headers' }),
            { status: 401, headers: { 'content-type': 'application/json' } }
        );
    }

    try {
        // Verify the signature is recent (within 5 minutes)
        const timestampNum = parseInt(timestamp);
        const now = Math.floor(Date.now() / 1000);
        if (now - timestampNum > 300) { // 5 minutes
            throw new Error('Signature expired');
        }

        // Verify the signature matches the address
        const message = `Authenticate ZeedChain API request at timestamp: ${timestamp}`;
        const recoveredAddress = verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            throw new Error('Invalid signature');
        }

        return NextResponse.next();
    } catch (error: any) {
        return new NextResponse(
            JSON.stringify({ error: error.message || 'Authentication failed' }),
            { status: 401, headers: { 'content-type': 'application/json' } }
        );
    }
}

export const config = {
    matcher: '/api/:path*',
};