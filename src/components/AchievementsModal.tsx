import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AchievementsGallery } from "./AchievementsGallery";
import { PurpleModalHeader } from "./PurpleModalHeader";

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementsModal({ isOpen, onClose }: AchievementsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none p-0 gap-0 border-0 flex flex-col">
        <PurpleModalHeader title="Your Achievements" onClose={onClose} />

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 bg-background">
          <AchievementsGallery />
        </div>
      </DialogContent>
    </Dialog>
  );
}
