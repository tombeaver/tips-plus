import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Upload, X, Heart, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [message, setMessage] = useState('');
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast({
        title: "Invalid file type",
        description: "Please upload only image files.",
        variant: "destructive",
      });
    }
    
    setScreenshots(prev => [...prev, ...imageFiles].slice(0, 3)); // Max 3 files
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please provide a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-feedback', {
        body: {
          rating,
          message,
          screenshots: screenshots.map(file => file.name), // Just send filenames for now
        }
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: "Feedback submitted!",
        description: "Thank you for your feedback. We'll review it soon.",
      });
      
      // Reset form
      setRating(0);
      setHoveredRating(0);
      setMessage('');
      setScreenshots([]);
      onClose();
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setHoveredRating(0);
    setMessage('');
    setScreenshots([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background to-background/95 border-primary/20">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            We'd love your feedback!
          </DialogTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Help us improve Tips+ with your thoughts and suggestions
          </p>
        </DialogHeader>
        
        <div className="space-y-8 py-4">
          {/* Rating */}
          <div className="space-y-4">
            <div className="text-center">
              <Label className="text-base font-medium">How would you rate your experience?</Label>
            </div>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-2 hover:scale-125 transition-all duration-200 rounded-full hover:bg-primary/5"
                >
                  <Star
                    className={`h-8 w-8 transition-all duration-200 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                        : 'text-muted-foreground hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div className="text-center animate-fade-in">
                <span className="text-sm text-primary font-medium">
                  {rating === 5 ? "Amazing! 🎉" : 
                   rating === 4 ? "Great! ⭐" : 
                   rating === 3 ? "Good 👍" : 
                   rating === 2 ? "Okay 😐" : 
                   "We can do better 😞"}
                </span>
              </div>
            )}
          </div>

          {/* Message */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <Label htmlFor="message" className="text-base font-medium">Share your thoughts</Label>
            </div>
            <Textarea
              id="message"
              placeholder="Tell us about your experience, report a bug, or suggest an improvement..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none border-primary/20 focus:border-primary/40 bg-background/50 backdrop-blur-sm"
            />
          </div>

          {/* Screenshot Upload */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              <Label className="text-base font-medium">Screenshots (optional)</Label>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="screenshot-upload"
                />
                <label htmlFor="screenshot-upload">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Images
                    </span>
                  </Button>
                </label>
                <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">
                  Max 3 images
                </span>
              </div>
              
              {screenshots.length > 0 && (
                <div className="grid grid-cols-3 gap-3 animate-fade-in">
                  {screenshots.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-primary/20 shadow-sm group-hover:shadow-md transition-all duration-200"
                      />
                      <button
                        onClick={() => removeScreenshot(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 hover:bg-destructive/90 shadow-md hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-6">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1 border-primary/30 hover:border-primary/50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || rating === 0}
              className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 disabled:from-muted disabled:to-muted"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Send Feedback
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};