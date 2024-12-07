export default function PagesIndex() {
    // Change the starting number to 3
    const startPage = 3;
    const numberOfPages = 100;
  
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-mono text-[#00ff00] mb-8">
            Available Pages
          </h1>
  
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: numberOfPages }).map((_, i) => (
              
                key={i}
                href={`/pages/${i + startPage}`}
                className="p-4 border border-[#00ff00]/30 rounded-lg 
                         hover:bg-[#00ff00]/10 transition-colors group"
              >
                <span className="text-[#00ff00]">Page {i + startPage}</span>
                <div className="text-[#00ff00]/50 text-sm">
                  Open for contribution
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }