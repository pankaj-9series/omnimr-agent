# OmniMR Next.js

A professional market research platform built with Next.js, featuring AI-powered CSV analytics and presentation generation.

## Features

- **CSV Upload & Analysis**: Upload CSV files and get AI-powered insights
- **Data Cleanup**: Quality checks and data cleaning tools
- **AI Conversation**: Chat with AI to analyze your data
- **Chart Generation**: Automatic chart recommendations and generation
- **Export Options**: Export to PowerPoint and PDF formats
- **Project Management**: Organize and manage multiple research projects

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API with LangGraph
- **Charts**: Recharts
- **File Processing**: Multer, CSV Parser

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env.local` file with:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=./uploads
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/chat` - Chat with AI
- `POST /api/csv/upload` - Upload CSV file
- `POST /api/csv/suggestion` - Get chart recommendations

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── charts/           # Chart components
│   ├── icons/            # Icon components
│   ├── screens/          # Screen components
│   └── ui/               # UI components
├── lib/                  # Shared utilities
│   ├── services/         # Service functions
│   ├── types/            # TypeScript types
│   └── constants.ts      # App constants
└── uploads/              # File upload directory
```

## Migration from React + Node.js

This project was migrated from a separate React.js frontend and Node.js backend to a unified Next.js application. The migration includes:

- ✅ Unified project structure
- ✅ Next.js API routes replacing Express server
- ✅ Integrated LangGraph agent service
- ✅ Maintained all original functionality
- ✅ TypeScript support throughout
- ✅ Modern Next.js 14 features

## Development

- **Build**: `npm run build`
- **Start**: `npm start`
- **Lint**: `npm run lint`

## License

MIT License
