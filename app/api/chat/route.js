import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const systemPrompt = `You are a customer support bot designed to assist individuals who are experiencing mental health issues...`; // Your system prompt

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  const data = await req.json();

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ message: 'API key is missing' }, { status: 500 });
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: systemPrompt }, ...data],
      model: 'llama3-8b-8192',
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              const text = encoder.encode(content);
              controller.enqueue(text);
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream);
  } catch (error) {
    console.error('Error handling chat request:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}