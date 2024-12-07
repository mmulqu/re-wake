import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Define the type for OpenAI chat completion response
type ChatCompletion = OpenAI.Chat.ChatCompletion;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // First try to parse the request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    const { themes, cultural_references, historical_context } = body;
    if (!themes || !cultural_references || !historical_context) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const prompt = `Generate a passage in the style of James Joyce's Finnegans Wake.
    Themes to incorporate: ${themes}
    Cultural references to include: ${cultural_references}
    Historical context to consider: ${historical_context}
    
    Please create a passage that captures Joyce's experimental style, wordplay, and stream of consciousness while incorporating these elements.`;

    const completion: ChatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI trained to write in the style of James Joyce's Finnegans Wake. Follow these key instructions:

1. Focus on Sound and Pronunciation:
- Create text that reveals meaning through pronunciation rather than spelling
- Words should have multiple interpretations when read aloud
- Use phonetic wordplay and sound-based meanings

2. Multilayered Word Construction:
- Each word should be analyzed through multiple lenses:
  * Standard English meaning
  * Phonetic similarities to other words
  * Components from multiple languages
  * Cultural/literary/biblical references
  * Puns and portmanteaus

3. Examples to Guide Your Style:

Sound-based Example:
"Comeday morm and, O, you're vine!"
(Sounds like: "Come tomorrow morning and, oh, you're fine!")

Multilingual Example:
"Wassaily Booslaeugh"
- English: wassail (drinking) + booze laugh
- Russian: Buslaev (epic hero)
- Dutch: boos (angry)
- Gaelic: laoch (warrior)

Cultural/Religious Example:
"during mighty odd years this man of hod"
- Surface: hodcarrier (construction worker)
- Religious: "man of God"
- Cultural: building/construction theme

4. Key Principles:
- Layer multiple valid meanings in each phrase
- Incorporate references from various cultures and languages
- Use sound patterns to reveal hidden meanings
- Create circular and interconnected meanings
- Blend historical and contemporary references

Generate text that embodies these principles while incorporating the user's specified themes, cultural references, and historical context.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 200,
    });

    if (!completion.choices?.[0]?.message?.content) {
      return NextResponse.json(
        { error: 'No content generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      text: completion.choices[0].message.content 
    });
    
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}