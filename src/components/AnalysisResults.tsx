import { Download, Palette, Sparkles, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AnalysisResultsProps {
  analysis: any;
  imageUrl: string;
}

const categoryIcons: Record<string, any> = {
  "Basic Correction": Sparkles,
  "Tonal Adjustment": Filter,
  "Color Grade": Palette,
  "Finishing": Sparkles,
};

const categoryColors: Record<string, string> = {
  "Basic Correction": "bg-accent/20 text-accent border-accent/30",
  "Tonal Adjustment": "bg-secondary/20 text-secondary border-secondary/30",
  "Color Grade": "bg-primary/20 text-primary border-primary/30",
  "Finishing": "bg-accent/20 text-accent border-accent/30",
};

export const AnalysisResults = ({ analysis, imageUrl }: AnalysisResultsProps) => {
  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(analysis, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `chromaleap-analysis-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const pipeline = analysis?.hypothesized_pipeline || [];
  const metadata = analysis?.analysis_metadata || {};

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Analysis Results
          </h2>
          <p className="text-muted-foreground">
            Identified {pipeline.length} editing steps • Analyzed by {metadata.analysis_engine}
          </p>
        </div>
        <Button 
          onClick={handleDownloadJSON}
          variant="outline"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Export JSON
        </Button>
      </div>

      {/* Image Preview */}
      <Card className="overflow-hidden border-2">
        <CardContent className="p-0">
          <img 
            src={imageUrl} 
            alt="Analyzed" 
            className="w-full h-auto max-h-96 object-contain bg-card"
          />
        </CardContent>
      </Card>

      {/* Pipeline Steps */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          Editing Pipeline
        </h3>
        
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {pipeline.map((step: any, index: number) => {
              const Icon = categoryIcons[step.effect_category] || Sparkles;
              const colorClass = categoryColors[step.effect_category] || categoryColors["Basic Correction"];
              
              return (
                <Card 
                  key={index} 
                  className="border-2 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          <Badge variant="outline" className="text-lg font-bold px-3 py-1">
                            {step.step_order}
                          </Badge>
                        </div>
                        <div className="space-y-2 flex-1">
                          <CardTitle className="text-xl flex items-center gap-2">
                            <Icon className="w-5 h-5" />
                            {step.effect_name}
                          </CardTitle>
                          <Badge className={`${colorClass} border`}>
                            {step.effect_category}
                          </Badge>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="text-sm font-mono"
                      >
                        {(step.confidence * 100).toFixed(0)}% confident
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Software Guess */}
                    <div>
                      <p className="text-sm font-semibold mb-2 text-muted-foreground">
                        Likely Software:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {step.software_guess?.map((software: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-sm">
                            {software}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Parameters */}
                    {step.estimated_parameters && Object.keys(step.estimated_parameters).length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-3 text-muted-foreground">
                          Estimated Parameters:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(step.estimated_parameters).map(([key, value]: [string, any]) => (
                            <div 
                              key={key} 
                              className="bg-muted/50 rounded-lg p-3 border border-border/50 hover:border-primary/50 transition-colors"
                            >
                              <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                                {key.replace(/_/g, ' ')}
                              </p>
                              <p className="text-sm font-mono font-semibold">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
