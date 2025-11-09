import { useState } from 'react';
import TiptapTypewriter from './TiptapTypewriter';

export default function FormattingDemo() {
  const [currentExample, setCurrentExample] = useState(0);
  
  const examples = [
    {
      title: "Headers & Basic Text",
      content: "# Main Heading\n\n## Sub Heading\n\n### Small Heading\n\nThis is regular text with **bold** and *italic* formatting.\n\nYou can also use ***bold and italic*** together!"
    },
    {
      title: "Bullet Lists",
      content: "# Features List\n\nHere are our key features:\n\n- **Easy to use** interface\n- **Fast** performance\n- **Reliable** service\n- **24/7** support\n\nAnd here's a nested example:\n\n- Main feature\n  - Sub feature 1\n  - Sub feature 2\n- Another main feature"
    },
    {
      title: "Numbered Lists",
      content: "# Setup Instructions\n\nFollow these steps:\n\n1. **Install** the dependencies\n2. **Configure** your settings\n3. **Run** the application\n4. **Test** everything works\n\nThat's it! You're ready to go."
    },
    {
      title: "Todo Lists",
      content: "# Project Checklist\n\nHere's what we need to complete:\n\n- [x] Design mockups\n- [x] Backend API\n- [ ] Frontend development\n- [ ] Testing phase\n- [ ] Deployment\n- [ ] Documentation\n\n*Keep track of your progress!*"
    },
    {
      title: "Mixed Content",
      content: "# Welcome to iLaunching!\n\n## What We Offer\n\n**Core Features:**\n- AI-powered insights\n- Real-time analytics\n- Custom dashboards\n\n## Getting Started\n\n1. Create your account\n2. Complete your profile\n3. Start your first project\n\n## Your Tasks\n\n- [x] Sign up completed\n- [ ] Profile setup\n- [ ] First project\n\n*Ready to launch your success?*"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">TiptapTypewriter Formatting Demo</h1>
        
        {/* Example selector */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => setCurrentExample(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentExample === index
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {example.title}
              </button>
            ))}
          </div>
        </div>

        {/* Demo area */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {examples[currentExample].title}
          </h2>
          
          <div className="border rounded-lg bg-gray-900 text-white">
            <TiptapTypewriter
              key={currentExample} // Force re-render when example changes
              text={examples[currentExample].content}
              speed={20}
              className="text-white"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '16px',
                color: 'white',
                minHeight: '300px',
                maxHeight: '500px',
              }}
            />
          </div>
          
          {/* Raw content display */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Raw Content (Markdown):</h3>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto text-gray-800">
              {examples[currentExample].content}
            </pre>
          </div>
        </div>
        
        {/* Usage guide */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Supported Formatting</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Headers</h4>
              <code className="block bg-white p-2 rounded text-blue-700">
                # Main Header<br/>
                ## Sub Header<br/>
                ### Small Header
              </code>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Text Formatting</h4>
              <code className="block bg-white p-2 rounded text-blue-700">
                **bold text**<br/>
                *italic text*<br/>
                ***bold italic***
              </code>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Bullet Lists</h4>
              <code className="block bg-white p-2 rounded text-blue-700">
                - Item 1<br/>
                - Item 2<br/>
                - Item 3
              </code>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Numbered Lists</h4>
              <code className="block bg-white p-2 rounded text-blue-700">
                1. First step<br/>
                2. Second step<br/>
                3. Third step
              </code>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Todo Lists</h4>
              <code className="block bg-white p-2 rounded text-blue-700">
                - [x] Completed<br/>
                - [ ] Todo<br/>
                - [ ] Another todo
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}