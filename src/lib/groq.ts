import type { GroqResponse, GeneratedModule, ExerciseType } from '../types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function callGroq(prompt: string, apiKey: string, model = 'llama-3.1-70b-versatile'): Promise<GroqResponse> {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { text: '', error: err.error?.message || err.message || `HTTP ${response.status}` };
    }
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    return { text };
  } catch (e) {
    return { text: '', error: e instanceof Error ? e.message : 'Network error' };
  }
}

export function buildModuleGenerationPrompt(topic: string, description: string): string {
  return `You are an expert instructional designer. Create a learning module for "${topic}". The user's goals: ${description}.

Return ONLY a JSON object in this exact format (no markdown fences, no extra text):
{
  "name": "Short module name",
  "icon": "BookOpen",
  "color": "#FF9600",
  "milestones": [
    {
      "title": "Milestone title",
      "description": "1 sentence description",
      "exercises": [
        {
          "type": "multiple-choice",
          "prompt": "Question text",
          "options": ["A", "B", "C"],
          "correctAnswer": "A",
          "context": "Helpful context"
        },
        {
          "type": "rearrangement",
          "prompt": "Rearrange these items",
          "blocks": ["Item 1", "Item 2", "Item 3"],
          "correctAnswer": ["Item 1", "Item 2", "Item 3"],
          "context": "Helpful context"
        },
        {
          "type": "production",
          "prompt": "Open-ended question or task",
          "context": "Grading criteria and hints"
        }
      ]
    }
  ]
}

Generate exactly 5-7 milestones. Each milestone must have exactly 3 exercises: one multiple-choice, one rearrangement, and one production. The icon field must be a Lucide icon name (e.g., BookOpen, Brain, Globe, Zap, FlaskConical, Code). The color field must be a hex color. Keep all content accurate and concise. Make the content progressively more difficult.`;
}

export function buildGradingPrompt(exerciseType: ExerciseType, prompt: string, userAnswer: string, context?: string): string {
  return `You are a strict technical adjudicator. Evaluate the following answer.

Exercise Type: ${exerciseType}
Prompt: ${prompt}
${context ? `Context/Grading Criteria: ${context}` : ''}

Student Answer:
"""
${userAnswer}
"""

Respond ONLY with valid JSON in this exact format (no markdown fences):
{
  "correct": true,
  "grade": "A+",
  "explanation": "Brief 1-2 sentence explanation of what was correct.",
  "bullets": ["Specific strength point 1", "Specific strength point 2"]
}

If incorrect:
{
  "correct": false,
  "grade": "C",
  "explanation": "Brief 1-2 sentence explanation of the main issue.",
  "bullets": ["Specific correction 1", "Specific correction 2", "Study tip"]
}

Be strict. For production exercises, only mark correct if the answer fully demonstrates the required framework or technical accuracy. For multiple-choice, be exact. For rearrangement, the order must match exactly.`;
}

export function buildHintPrompt(prompt: string, context?: string): string {
  return `You are a helpful tutor. The student is stuck on this exercise. Give a concise, one-sentence conceptual hint.

Exercise: ${prompt}
${context ? `Context: ${context}` : ''}

Respond with exactly one sentence. No markdown, no JSON, just plain text.`;
}

export function buildModuleEditPrompt(module: { name: string; milestones: any[] }, userAnswers: string[]): string {
  return `You are an expert curriculum designer. A student has completed this module:

Module: ${module.name}
Milestones: ${JSON.stringify(module.milestones.map(m => m.title))}

Their answers were: ${JSON.stringify(userAnswers)}

Your task: Create an ADVANCED follow-up module for the same discipline that builds on what they learned. Return ONLY a JSON object in this exact format:
{
  "name": "Advanced [topic]",
  "icon": "Brain",
  "color": "#FF9600",
  "milestones": [
    {
      "title": "Advanced topic",
      "description": "1 sentence",
      "exercises": [
        {
          "type": "multiple-choice",
          "prompt": "Harder question",
          "options": ["A", "B", "C"],
          "correctAnswer": "A",
          "context": "Context"
        },
        {
          "type": "rearrangement",
          "prompt": "Rearrange",
          "blocks": ["1", "2", "3"],
          "correctAnswer": ["1", "2", "3"],
          "context": "Context"
        },
        {
          "type": "production",
          "prompt": "Advanced task",
          "context": "Grading criteria"
        }
      ]
    }
  ]
}

Generate exactly 3-5 advanced milestones. Each milestone must have 3 exercises. Make the content significantly more challenging. Use only Lucide icon names and hex colors. No markdown fences.`;
}

export function parseGeneratedModule(json: string): GeneratedModule | null {
  try {
    const cleaned = json.replace(/```json?\s*/g, '').replace(/```\s*$/g, '').trim();
    const parsed = JSON.parse(cleaned) as GeneratedModule;
    if (!parsed.name || !parsed.milestones || parsed.milestones.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}
