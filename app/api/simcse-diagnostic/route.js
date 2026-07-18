import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const simcseUrl = process.env.NEXT_PUBLIC_SIMCSE_API_URL || 'http://localhost:5000/score';
    
    console.log(`🔍 SimCSE Diagnostic:`);
    console.log(`   NEXT_PUBLIC_SIMCSE_API_URL: ${process.env.NEXT_PUBLIC_SIMCSE_API_URL}`);
    console.log(`   Fallback URL: ${simcseUrl}`);
    console.log(`   Environment NODE_ENV: ${process.env.NODE_ENV}`);

    // Try to connect to SimCSE
    try {
      const testRes = await fetch(simcseUrl === 'http://localhost:5000/score' 
        ? 'http://localhost:5000/health' 
        : simcseUrl.replace('/score', '/health'), 
        { 
          method: 'GET',
          timeout: 5000 
        }
      );
      
      console.log(`   ✅ SimCSE API reachable: ${testRes.ok}`);
      
      return NextResponse.json({
        simcseUrl,
        isConfigured: !!process.env.NEXT_PUBLIC_SIMCSE_API_URL,
        reachable: testRes.ok,
        status: testRes.status,
        environment: process.env.NODE_ENV,
        message: 'Check browser console for full diagnostics'
      });
    } catch (connectErr) {
      console.log(`   ❌ SimCSE API not reachable: ${connectErr.message}`);
      return NextResponse.json({
        simcseUrl,
        isConfigured: !!process.env.NEXT_PUBLIC_SIMCSE_API_URL,
        reachable: false,
        error: connectErr.message,
        environment: process.env.NODE_ENV,
        message: 'SimCSE API not available - using fallback Jaccard similarity'
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Diagnostic error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
