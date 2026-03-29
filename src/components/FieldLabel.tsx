import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Info } from 'lucide-react';

interface FieldLabelProps {
  htmlFor?: string;
  label: string;
  required?: boolean;
  infoTitle: string;
  infoDescription: string;
  children?: React.ReactNode;
  className?: string;
}

export const FieldLabel: React.FC<FieldLabelProps> = ({
  htmlFor,
  label,
  required = false,
  infoTitle,
  infoDescription,
  children,
  className = '',
}) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <div className={`flex items-center gap-1.5 ${className}`}>
        <Label htmlFor={htmlFor} className="flex items-center gap-1">
          {children}
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        <button
          type="button"
          onClick={() => setShowInfo(true)}
          className="text-muted-foreground hover:text-primary transition-colors"
          aria-label={`Info about ${label}`}
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </div>

      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Info className="h-5 w-5 text-primary" />
              {infoTitle}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {infoDescription}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};
