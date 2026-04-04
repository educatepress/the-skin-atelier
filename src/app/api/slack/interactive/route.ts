import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // --- DEPRECATED: Vercel Webhook Endpoint ---
  // The system now uses agents/slack_ag_system/slack_listener.py (Socket Mode)
  // as the Master Dispatcher for all Slack interactivity.
  // This file is kept only as a tombstone.
  
  console.warn("⚠️ Slack Webhook triggered on Vercel, but Socket Mode should be active!");
  
  return NextResponse.json(
    { error: "This endpoint is deprecated. All Slack interactions are now handled by AG Socket Mode Listener locally." }, 
    { status: 405 }
  );
}
