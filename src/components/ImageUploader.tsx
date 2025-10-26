import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onAnalysisComplete: (analysis: any, imageUrl: string) => void;
}

export const ImageUploader = ({ onAnalysisComplete }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      await processImage(imageFile);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload an image file (JPG, PNG, WEBP)",
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processImage(file);
    }
  };

  const processImage = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('image-analyses')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(50);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('image-analyses')
        .getPublicUrl(filePath);

      setIsUploading(false);
      setIsAnalyzing(true);

      // Call analysis edge function
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-image', {
        body: { imageUrl: publicUrl }
      });

      if (analysisError) {
        throw analysisError;
      }

      if (!analysisData.success) {
        throw new Error(analysisData.error || 'Analysis failed');
      }

      toast({
        title: "Analysis complete!",
        description: `Identified ${analysisData.analysis.hypothesized_pipeline?.length || 0} editing steps`,
      });

      onAnalysisComplete(analysisData.analysis, publicUrl);

    } catch (error: any) {
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const isProcessing = isUploading || isAnalyzing;

  return (
    <Card
      className={`
        relative overflow-hidden border-2 border-dashed transition-all duration-300 cursor-pointer
        ${isDragging ? 'border-primary bg-primary/5 scale-105' : 'border-border hover:border-primary/50'}
        ${isProcessing ? 'pointer-events-none' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <div className="p-12 text-center space-y-4">
        {isProcessing ? (
          <>
            <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">
                {isUploading ? 'Uploading...' : 'Analyzing Image...'}
              </h3>
              <p className="text-muted-foreground">
                {isUploading ? 'Uploading your image to the cloud' : 'AI is reverse-engineering the editing pipeline'}
              </p>
              {isUploading && (
                <div className="w-full max-w-xs mx-auto mt-4">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Upload className="w-16 h-16 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Drop your image here</h3>
              <p className="text-muted-foreground">
                or click to browse files
              </p>
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG, WEBP (max 20MB)
              </p>
            </div>
            <Button variant="outline" className="mt-4">
              Select Image
            </Button>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </Card>
  );
};
