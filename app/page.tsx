"use client";
import { useState } from 'react';
import { SignedIn, SignedOut, useUser } from '@clerk/nextjs';

// Spinner Component
const CelticSpiral = () => (
  <svg className="animate-spin h-8 w-8" viewBox="0 0 100 100">
    <path
      fill="none"
      stroke="#00ff00"
      strokeWidth="6"
      d="M50,10 
         A40,40 0 0,1 90,50 
         A40,40 0 0,1 50,90 
         A40,40 0 0,1 10,50 
         A40,40 0 0,1 50,10 
         A30,30 0 0,0 80,50 
         A30,30 0 0,0 50,80 
         A30,30 0 0,0 20,50 
         A30,30 0 0,0 50,20 
         A20,20 0 0,1 70,50 
         A20,20 0 0,1 50,70 
         A20,20 0 0,1 30,50 
         A20,20 0 0,1 50,30"
    />
  </svg>
);

// Create a sign-in message component
const SignInMessage = () => (
  <div className="min-h-screen flex items-center justify-center bg-black px-4">
    <div className="max-w-md w-full">
      <div className="bg-black/50 border border-[#00ff00]/30 rounded-lg p-8 shadow-lg shadow-[#00ff00]/20">
        <h1 className="text-3xl font-bold text-center mb-4 text-[#00ff00] font-mono">
          Re-wakening
        </h1>
        <p className="text-center text-[#00ff00]/80 font-mono">
          Sign in to generate Finnegans Wake-inspired passages
        </p>
      </div>
    </div>
  </div>
);

export default function Home() {
  const { user } = useUser();
  const [themes, setThemes] = useState('');
  const [culturalReferences, setCulturalReferences] = useState('');
  const [historicalContext, setHistoricalContext] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Please sign in to generate text");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedText('');

    try {
      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          themes,
          cultural_references: culturalReferences,
          historical_context: historicalContext,
          userId: user.id,
        }),
      });

      // Clone the response so we can try text if JSON fails
      const responseClone = generateResponse.clone();
      let data: any;

      try {
        data = await generateResponse.json();
      } catch (parseError) {
        console.error('Failed to parse JSON from /api/generate:', parseError);
        try {
          const text = await responseClone.text();
          console.error('Raw response text:', text);
          data = { error: text || 'No error details available' };
        } catch (textError) {
          console.error('Could not read text from response:', textError);
          data = { error: 'No error details available' };
        }
      }

      if (!generateResponse.ok) {
        throw new Error(data.error || 'Failed to generate text');
      }

      if (!data.text) {
        throw new Error('No text was generated');
      }

      setGeneratedText(data.text);

      // Attempt to save the generated text
      const saveResponse = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: data.text,
          metadata: {
            themes,
            references: culturalReferences,
            historicalContext,
          },
        }),
      });

      if (!saveResponse.ok) {
        console.error('Failed to save to database');
      }

    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'An unexpected error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SignedOut>
        <SignInMessage />
      </SignedOut>
      <SignedIn>
        <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8 text-[#00ff00]">
          <div className="max-w-3xl mx-auto">
            <div className="bg-black/50 border border-[#00ff00]/30 rounded-lg p-6 shadow-lg shadow-[#00ff00]/20">
              <h1 className="text-3xl font-bold text-center mb-8 text-[#00ff00] font-mono">
                Finnegans Wake Passage Generator
              </h1>
              
              {error && (
                <div className="mt-4 p-4 border border-red-500/50 bg-black/30 rounded-lg">
                  <p className="text-red-500 font-mono text-sm">
                    Error: {error}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#00ff00] font-mono">
                    Themes
                    <textarea
                      value={themes}
                      onChange={(e) => setThemes(e.target.value)}
                      className="mt-1 block w-full rounded-md border-[#00ff00]/50 bg-black/50 
                               text-[#00ff00] shadow-sm focus:border-[#00ff00] focus:ring-[#00ff00] 
                               placeholder-[#00ff00]/50 font-mono"
                      placeholder="Enter themes (e.g., cyclical history, dreams, language)"
                      rows={2}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#00ff00] font-mono">
                    Cultural References
                    <textarea
                      value={culturalReferences}
                      onChange={(e) => setCulturalReferences(e.target.value)}
                      className="mt-1 block w-full rounded-md border-[#00ff00]/50 bg-black/50 
                               text-[#00ff00] shadow-sm focus:border-[#00ff00] focus:ring-[#00ff00] 
                               placeholder-[#00ff00]/50 font-mono"
                      placeholder="Enter cultural references (e.g., Irish mythology, Catholic tradition)"
                      rows={2}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#00ff00] font-mono">
                    Historical Context
                    <textarea
                      value={historicalContext}
                      onChange={(e) => setHistoricalContext(e.target.value)}
                      className="mt-1 block w-full rounded-md border-[#00ff00]/50 bg-black/50 
                               text-[#00ff00] shadow-sm focus:border-[#00ff00] focus:ring-[#00ff00] 
                               placeholder-[#00ff00]/50 font-mono"
                      placeholder="Enter historical context (e.g., Dublin in the 1920s, Irish independence)"
                      rows={2}
                    />
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-[#00ff00] 
                             rounded-md shadow-sm text-sm font-mono text-black bg-[#00ff00] 
                             hover:bg-[#00ff00]/90 focus:outline-none focus:ring-2 
                             focus:ring-offset-2 focus:ring-[#00ff00] disabled:bg-[#00ff00]/50
                             hover:shadow-[#00ff00]/50 hover:shadow-lg transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <CelticSpiral />
                        <span>Conjuring Words...</span>
                      </>
                    ) : (
                      'Generate Passage'
                    )}
                  </button>
                </div>
              </form>

              {isLoading && (
                <div className="flex flex-col items-center justify-center mt-8">
                  <CelticSpiral />
                  <p className="text-[#00ff00] mt-4 font-mono text-sm animate-pulse">
                    Weaving Joycean dreams...
                  </p>
                </div>
              )}

              {generatedText && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4 text-[#00ff00] font-mono">Generated Passage:</h2>
                  <div className="bg-black/30 border border-[#00ff00]/30 rounded-lg p-6">
                    <p className="whitespace-pre-wrap font-mono text-[#00ff00] leading-relaxed">
                      {generatedText}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SignedIn>
    </>
  );
}
