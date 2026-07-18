import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const simcseUrl = process.env.NEXT_PUBLIC_SIMCSE_API_URL || 'http://localhost:5000/score';
    
    console.log(`🔍 SimCSE Diagnostic:`);
    console.log(`   NEXT_PUBLIC_SIMCSE_API_URL: ${process.env.NEXT_PUBLIC_SIMCSE_API_URL}`);
    console.log(`   Fallback URL: ${simcseUrl}`);
    console.log(`   Environment NODE_ENV: ${process.env.NODE_ENV}`);

    // Try to connect to SimCSE
    let reachable = false;
    let errorMessage = '';
    let testScore = null;
    
    try {
      const healthUrl = simcseUrl === 'http://localhost:5000/score' 
        ? 'http://localhost:5000/health' 
        : simcseUrl.replace('/score', '/health');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const testRes = await fetch(healthUrl, { 
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      reachable = testRes.ok;
      console.log(`   ✅ SimCSE API reachable: ${reachable}`);
      
      // If reachable, try a test score
      if (reachable) {
        try {
          const scoreRes = await fetch(simcseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text1: 'The cat sat on the mat',
              text2: 'A cat was sitting on a mat'
            }),
            signal: controller.signal
          });
          
          if (scoreRes.ok) {
            const scoreData = await scoreRes.json();
            testScore = scoreData.similarity;
            console.log(`   📊 Test score (similar sentences): ${testScore?.toFixed(4)}`);
          }
        } catch (scoreErr) {
          console.log(`   ⚠️ Test score failed: ${scoreErr.message}`);
        }
      }
    } catch (connectErr) {
      console.log(`   ❌ SimCSE API not reachable: ${connectErr.message}`);
      errorMessage = connectErr.message;
    }
    
    return NextResponse.json({
      simcseUrl,
      isConfigured: !!process.env.NEXT_PUBLIC_SIMCSE_API_URL,
      reachable,
      testScore,
      error: errorMessage || undefined,
      environment: process.env.NODE_ENV,
      recommendation: !reachable ? 'Start SimCSE server with: python simcse-api/run_server.py' : 'Server is running correctly'
    });
  } catch (error) {
    console.error('Diagnostic error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
