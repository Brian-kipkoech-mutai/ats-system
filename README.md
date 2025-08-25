# ATS-Lite - Transparent AI-Powered Candidate Matching

A Next.js application that demonstrates transparent AI agent workflows for candidate matching. Watch the ATS think through its decision-making process in real-time.

## Features

- **Transparent MCP Workflow**: Think → Act → Act → Speak process with live timeline
- **Natural Language Queries**: Ask for candidates using plain English
- **Real-time Animations**: Smooth transitions and staggered animations throughout
- **Candidate Filtering & Ranking**: Advanced filtering and scoring algorithms
- **Interactive Results**: Click candidates for detailed information
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- OpenAI API key

### Installation

1. **Clone and install dependencies:**
   \`\`\`bash
   git clone <your-repo-url>
   cd ats-system
   pnpm install
   \`\`\`

2. **Set up environment variables:**
   \`\`\`bash
   cp .env.example .env.local
   # Edit .env.local and add your OpenAI API key
   \`\`\`

3. **Run the development server:**
   \`\`\`bash
   pnpm dev
   \`\`\`

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage Examples

Try these natural language queries:

- "Backend engineers in Germany, most experience first"
- "Frontend developers willing to relocate, sorted by salary"
- "Remote React developers with 5+ years experience"
- "Full-stack engineers in Europe, available within 2 weeks"

## How It Works

### MCP Workflow

1. **THINK**: LLM analyzes your query and generates filter/ranking plans
2. **ACT 1**: System filters candidates based on the plan
3. **ACT 2**: System ranks filtered candidates by specified criteria
4. **SPEAK**: LLM generates a human-friendly summary of results

### Core Tools

- `filterCandidates(plan)`: Boolean/regex filtering with include/exclude logic
- `rankCandidates(ids, plan)`: Scores and sorts candidates by multiple criteria
- `aggregateStats(ids)`: Generates summary statistics for result sets

## Testing

Run the test suite:

\`\`\`bash
pnpm test
\`\`\`

The test suite includes:
- Filter functionality validation
- Ranking algorithm verification
- Statistics calculation accuracy
- Edge case handling

### Example Test Case

 ```typescript
// Input: "React dev, Cyprus, sort by experience desc"
// Expectation: candidate #12 appears above #5
const filtered = filterCandidates({ include: { skills: ["react"], location: ["cyprus"] } })
const ranked = rankCandidates(filtered.map(c => c.id), { primary: "experience", order: "desc" })
expect(ranked[0].id).toBe("12") // 7 years experience
expect(ranked[1].id).toBe("5")  // 3 years experience

## Architecture

### Project Structure


├── app/
│   ├── api/mcp/          # MCP workflow API endpoints
│   ├── layout.tsx        # Root layout with fonts
│   └── page.tsx          # Main application page
├── components/
│   ├── ats/              # ATS-specific components
│   └── ui/               # Reusable UI components
├── lib/
│   ├── data.ts           # Core filtering/ranking tools
│   ├── mcp-workflow.ts   # Workflow orchestration
│   └── types.ts          # TypeScript definitions
└── __tests__/            # Test files


### Key Technologies

- **Next.js 15**: App Router with API routes
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **AI SDK**: google integration with structured outputs
- **shadcn/ui**: High-quality component library

## Data Source

The application uses a CSV dataset with 50+ candidate profiles including:
- Personal information (name, location, experience)
- Skills and technologies
- Work preferences and availability
- Salary expectations and visa status

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your `GOOGLE_GENERATIVE_AI_API_KEY` environment variable
4. Deploy automatically

### Other Platforms

The application is a standard Next.js app and can be deployed to any platform supporting Node.js.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | OpenAI API key for LLM calls | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL for redirects | No |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues or questions:
1. Check the GitHub issues
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

---

Built with ❤️ using Next.js, TypeScript, and AI SDK.
