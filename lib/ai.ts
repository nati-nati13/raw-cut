import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function generateProductDescription(params: {
  title: string
  category: string
  tags: string[]
}): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a copywriter for RAW CUT, a curated marketplace for independent fashion and product designers. Write short, evocative product descriptions (2–3 sentences). Focus on material, mood, and uniqueness. No filler, no bullet points.',
      },
      {
        role: 'user',
        content: `Product: "${params.title}"\nCategory: ${params.category}\nTags: ${params.tags.join(', ')}`,
      },
    ],
    max_tokens: 120,
    temperature: 0.8,
  })
  return completion.choices[0].message.content?.trim() ?? ''
}

export async function generateProductTags(params: {
  title: string
  description: string
  category: string
}): Promise<string[]> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a tagging assistant for a fashion marketplace. Return 6–10 lowercase single-word or hyphenated tags as a JSON array. No explanations, just the array.',
      },
      {
        role: 'user',
        content: `Product: "${params.title}"\nCategory: ${params.category}\nDescription: ${params.description}`,
      },
    ],
    max_tokens: 80,
    temperature: 0.5,
    response_format: { type: 'json_object' },
  })
  try {
    const json = JSON.parse(completion.choices[0].message.content ?? '{}')
    return Array.isArray(json.tags) ? json.tags : []
  } catch {
    return []
  }
}
