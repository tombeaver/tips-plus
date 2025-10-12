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
      <DialogContent className="w-screen h-screen max-w-none p-0 gap-0 border-0">
        {/* Fixed Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-semibold text-white">
                Your Achievements
              </DialogTitle>
              <p className="text-white/80 text-sm mt-0.5">
                Unlock badges and milestones as you progress in your journey
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 bg-background p-6">
          <AchievementsGallery />
        </div>
      </DialogContent>
    </Dialog>
  );
}
