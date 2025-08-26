# Work Assignment Management System

A comprehensive task allocation and tracking platform built with Next.js and Supabase, designed to streamline workflow management within organizations.

## Features

### Admin Panel
- **Task Management**: Create, assign, and monitor tasks with priority levels and due dates
- **Employee Management**: Add, edit, and remove employee accounts
- **Document Attachment**: Upload PDF documents to tasks for reference
- **Progress Tracking**: Real-time visibility into task status and completion rates
- **Notes System**: Add administrative notes and track communication

### Employee Portal
- **Task Dashboard**: View assigned tasks with status indicators and priority levels
- **AI Task Assistant**: Intelligent chatbot powered by OpenAI to help research and simplify tasks
- **Document Access**: Download and view attached PDF documents
- **Status Updates**: Update task progress (Pending → In Progress → Completed)
- **Personal Notes**: Add clarifications and progress updates
- **Overdue Alerts**: Visual indicators for overdue tasks

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Supabase (PostgreSQL database, Authentication, File Storage)
- **AI Integration**: OpenAI GPT-3.5-turbo for intelligent task assistance
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account
- OpenAI API account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd work-assignment-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor

4. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses the following main tables:

- **users**: User profiles with role-based access (admin/employee)
- **tasks**: Task assignments with status, priority, and due dates
- **task_documents**: File attachments linked to tasks
- **task_notes**: Communication and progress notes

## Authentication & Security

- **Row Level Security (RLS)**: Implemented on all tables
- **Role-based Access**: Admin and Employee roles with different permissions
- **Secure File Storage**: PDF documents stored in Supabase Storage with access controls
- **Session Management**: Automatic session handling with Supabase Auth

## Demo Credentials

For testing purposes, you can create demo accounts:

**Admin Account:**
- Email: admin@company.com
- Password: admin123

**Employee Account:**
- Email: employee@company.com  
- Password: employee123

## Usage

### For Administrators

1. **Login** with admin credentials
2. **Create Tasks**: Navigate to "Create New Task" to assign work
3. **Manage Employees**: Add/edit employee accounts in the employee management section
4. **Upload Documents**: Attach PDF files to tasks for reference
5. **Monitor Progress**: Track task completion and employee workload

### For Employees

1. **Login** with employee credentials
2. **View Tasks**: See all assigned tasks on the dashboard
3. **AI Assistant**: Click the chatbot icon to get help with task research, analysis, and simplification
4. **Update Status**: Change task status as work progresses
5. **Download Documents**: Access attached PDF files
6. **Add Notes**: Communicate progress and ask questions

### AI Task Assistant Features

The AI chatbot can help employees with:
- **Task Analysis**: Break down complex tasks into manageable steps
- **Research Assistance**: Get suggestions for approaches and methodologies
- **Best Practices**: Receive recommendations for industry standards
- **Clarification**: Ask questions about task requirements and expectations
- **Time Management**: Get tips for prioritizing and organizing work
- **Problem Solving**: Discuss challenges and get potential solutions

## File Structure

```
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   ├── employee/          # Employee portal pages
│   └── login/             # Authentication pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── layout/           # Layout components
├── lib/                  # Utility functions and API calls
├── supabase/             # Database schema and migrations
└── public/               # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.
