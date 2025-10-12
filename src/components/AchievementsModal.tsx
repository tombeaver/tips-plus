import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { AchievementsGallery } from "./AchievementsGallery";
import { Button } from "@/components/ui/button";

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementsModal({ isOpen, onClose }: AchievementsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none p-0 gap-0 border-0 flex flex-col">
        {/* Sticky Header Section - Purple Header ONLY */}
        <div className="sticky top-0 z-10 h-20 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 px-6 pt-[50px] flex items-center justify-between">
          <DialogTitle className="text-2xl font-semibold text-white">
            Your Achievements
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 bg-background">
          <AchievementsGallery />
        </div>
      </DialogContent>
    </Dialog>
  );
}
