import nodemailer from 'nodemailer'

export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

export interface TaskAssignmentEmailData {
  employeeName: string
  employeeEmail: string
  taskTitle: string
  taskDescription: string
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  assignedBy: string
  adminNote?: string
}

// Create email transporter
export function createEmailTransporter() {
  const config: EmailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || '',
    },
  }

  // Use Nodemailer's createTransport (createTransporter does not exist)
  return nodemailer.createTransport(config)
}

// Generate task assignment email HTML template
export function generateTaskAssignmentEmail(data: TaskAssignmentEmailData): string {
  const priorityColors = {
    low: '#10B981',
    medium: '#F59E0B', 
    high: '#EF4444'
  }

  const priorityColor = priorityColors[data.priority]

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Task Assignment</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">📋 New Task Assigned</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hello <strong>${data.employeeName}</strong>,</p>
        
        <p style="font-size: 16px; margin-bottom: 25px;">You have been assigned a new task by <strong>${data.assignedBy}</strong>.</p>
        
        <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid ${priorityColor}; margin: 25px 0;">
          <h2 style="color: #2d3748; margin-top: 0; font-size: 22px;">${data.taskTitle}</h2>
          
          <div style="margin: 15px 0;">
            <span style="background: ${priorityColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
              ${data.priority} Priority
            </span>
          </div>
          
          <p style="color: #4a5568; font-size: 16px; margin: 15px 0;"><strong>Description:</strong></p>
          <p style="color: #718096; font-size: 15px; line-height: 1.6;">${data.taskDescription}</p>
          
          ${data.dueDate ? `
            <p style="color: #4a5568; font-size: 16px; margin: 15px 0 5px 0;"><strong>Due Date:</strong></p>
            <p style="color: #e53e3e; font-size: 15px; font-weight: bold;">${new Date(data.dueDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          ` : ''}
          
          ${data.adminNote ? `
            <div style="background: #edf2f7; padding: 15px; border-radius: 6px; margin-top: 20px;">
              <p style="color: #4a5568; font-size: 14px; margin: 0 0 8px 0;"><strong>📝 Admin Note:</strong></p>
              <p style="color: #718096; font-size: 14px; margin: 0; font-style: italic;">${data.adminNote}</p>
            </div>
          ` : ''}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/employee" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Task Dashboard
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        
        <p style="color: #718096; font-size: 14px; text-align: center; margin: 0;">
          This is an automated notification from TaskFlow Management System.<br>
          Please log in to your dashboard to view full task details and update status.
        </p>
      </div>
    </body>
    </html>
  `
}

// Send task assignment email
export async function sendTaskAssignmentEmail(data: TaskAssignmentEmailData): Promise<boolean> {
  try {
    const transporter = createEmailTransporter()
    // Verify transporter to get a clearer error early (auth/connection)
    try {
      await transporter.verify()
      console.log('Email transporter verified successfully')
    } catch (verr: any) {
      console.error('Email transporter verification failed:', {
        message: verr?.message,
        code: verr?.code,
        command: verr?.command,
        response: verr?.response,
        responseCode: verr?.responseCode,
      })
      throw verr
    }
    
    const mailOptions = {
      from: `"TaskFlow System" <${process.env.EMAIL_USER}>`,
      to: data.employeeEmail,
      subject: `📋 New Task Assigned: ${data.taskTitle}`,
      html: generateTaskAssignmentEmail(data),
      text: `
        New Task Assigned: ${data.taskTitle}
        
        Hello ${data.employeeName},
        
        You have been assigned a new task by ${data.assignedBy}.
        
        Task: ${data.taskTitle}
        Priority: ${data.priority.toUpperCase()}
        Description: ${data.taskDescription}
        ${data.dueDate ? `Due Date: ${new Date(data.dueDate).toLocaleDateString()}` : ''}
        ${data.adminNote ? `Admin Note: ${data.adminNote}` : ''}
        
        Please log in to your dashboard to view full details and update the task status.
        
        Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/employee
      `
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Task assignment email sent:', info.messageId)
    return true
  } catch (error) {
    const e: any = error
    console.error('Failed to send task assignment email:', {
      message: e?.message,
      code: e?.code,
      command: e?.command,
      response: e?.response,
      responseCode: e?.responseCode,
      stack: e?.stack,
    })
    return false
  }
}
