import { NextRequest, NextResponse } from 'next/server'
import { sendTaskAssignmentEmail, TaskAssignmentEmailData } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const emailData: TaskAssignmentEmailData = await request.json()

    // Validate required fields
    if (!emailData.employeeEmail || !emailData.employeeName || !emailData.taskTitle) {
      return NextResponse.json(
        { error: 'Missing required email data' },
        { status: 400 }
      )
    }

    // Check if email is configured
    console.log('Email config check:', {
      EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
      EMAIL_PASS: process.env.EMAIL_PASS ? 'SET' : 'NOT SET',
      EMAIL_HOST: process.env.EMAIL_HOST || 'NOT SET'
    })
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email not configured, skipping email notification')
      return NextResponse.json(
        { success: false, message: 'Email service not configured' },
        { status: 200 }
      )
    }

    const success = await sendTaskAssignmentEmail(emailData)

    if (success) {
      return NextResponse.json(
        { success: true, message: 'Email sent successfully' },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to send email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
