import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy } from "lucide-react";
import { AchievementsGallery } from "./AchievementsGallery";

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementsModal({ isOpen, onClose }: AchievementsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background to-background/95 border-primary/20">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Your Achievements
          </DialogTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Unlock badges and milestones as you progress in your journey
          </p>
        </DialogHeader>

        <div className="py-4">
          <AchievementsGallery />
        </div>
      </DialogContent>
    </Dialog>
  );
}
