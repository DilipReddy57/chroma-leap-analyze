import { useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { AnalysisResults } from "@/components/AnalysisResults";
import { Sparkles } from "lucide-react";

const Index = () => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleAnalysisComplete = (analysisData: any, url: string) => {
    setAnalysis(analysisData);
    setImageUrl(url);
  };

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Hero Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="w-8 h-8 text-primary" />
              <div className="absolute inset-0 blur-xl bg-primary/30" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                ChromaLeap Analyst
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-Powered Image Effect Reverse Engineering
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {!analysis ? (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold">
                Reverse Engineer Any Edit
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Upload an image and let AI analyze the post-processing pipeline, 
                extracting effects, parameters, and software suggestions.
              </p>
            </div>
            <ImageUploader onAnalysisComplete={handleAnalysisComplete} />
            
            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="text-center space-y-2 p-6 rounded-lg bg-card border border-border/50">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">AI Vision Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced computer vision models analyze color, tone, and effects
                </p>
              </div>
              
              <div className="text-center space-y-2 p-6 rounded-lg bg-card border border-border/50">
                <div className="w-12 h-12 mx-auto rounded-full bg-secondary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold">Parameter Extraction</h3>
                <p className="text-sm text-muted-foreground">
                  Get quantitative estimates for exposure, contrast, curves, and more
                </p>
              </div>
              
              <div className="text-center space-y-2 p-6 rounded-lg bg-card border border-border/50">
                <div className="w-12 h-12 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold">Software Mapping</h3>
                <p className="text-sm text-muted-foreground">
                  Identifies likely tools used: DaVinci Resolve, Photoshop, Lightroom
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <AnalysisResults analysis={analysis} imageUrl={imageUrl} />
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setAnalysis(null);
                  setImageUrl("");
                }}
                className="text-primary hover:underline"
              >
                ← Analyze another image
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          <p>Powered by Lovable AI • Built with React, TypeScript & Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
