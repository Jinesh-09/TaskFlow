import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('Chat API called')
  
  try {
    const { message, tasks, userProfile } = await request.json()
    console.log('Request data:', { message, tasksCount: tasks?.length, userName: userProfile?.full_name })

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      console.log('OpenAI API key not configured properly')
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add your OpenAI API key to the .env.local file.' },
        { status: 200 }
      )
    }

    // Try to import and use OpenAI
    let OpenAI
    try {
      OpenAI = (await import('openai')).default
      console.log('OpenAI imported successfully')
    } catch (importError) {
      console.error('Failed to import OpenAI:', importError)
      return NextResponse.json(
        { error: 'OpenAI package import failed. Please check installation.' },
        { status: 200 }
      )
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Create context about the user's tasks
    const taskContext = tasks.map((task: any) => ({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date,
      admin_note: task.admin_note
    }))

    const systemPrompt = `You are an AI assistant helping ${userProfile?.full_name || 'an employee'} with their work tasks. You have access to their current task list and can help them:

1. Research and analyze their tasks
2. Break down complex tasks into smaller steps
3. Suggest approaches and best practices
4. Provide clarification on requirements
5. Offer time management and productivity tips
6. Help with task prioritization

Current tasks:
${JSON.stringify(taskContext, null, 2)}

Be helpful, concise, and professional. Focus on actionable advice and practical solutions. If asked about specific tasks, reference them by title. Always maintain a supportive and encouraging tone.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const responseMessage = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    console.log('OpenAI response received successfully')
    return NextResponse.json({ message: responseMessage })
  } catch (error) {
    console.error('Error in chat API:', error)
    
    // More specific error handling
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack)
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid OpenAI API key. Please check your API key configuration.' },
          { status: 200 }
        )
      }
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'OpenAI API quota exceeded. Please check your usage limits.' },
          { status: 200 }
        )
      }
    }
    
    return NextResponse.json(
      { error: `Failed to process chat request: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 200 }
    )
  }
}
