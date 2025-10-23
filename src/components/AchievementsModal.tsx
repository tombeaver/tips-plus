import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AchievementsGallery } from "./AchievementsGallery";
import { PurpleModalHeader } from "./PurpleModalHeader";
import { UserAchievement } from "@/hooks/useAchievements";

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: UserAchievement[];
  loading?: boolean;
}

export function AchievementsModal({ isOpen, onClose, achievements, loading }: AchievementsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none p-0 gap-0 border-0 flex flex-col">
        <PurpleModalHeader title="Your Achievements" onClose={onClose} />

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 bg-background">
          <AchievementsGallery achievements={achievements} loading={loading} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
