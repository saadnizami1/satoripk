import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    // Use server-side env variable (without NEXT_PUBLIC prefix)
    const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY

    if (!apiKey) {
      console.error('Groq API key not found in environment variables')
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      )
    }

    console.log('API Key present:', apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No')

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.8,
        max_tokens: 500,
        top_p: 0.9
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API Error Response:', response.status, errorText)

      let errorData = {}
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }

      console.error('Groq Error Details:', errorData)

      return NextResponse.json(
        {
          error: `Groq API Error ${response.status}`,
          details: errorData
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}