import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PurpleModalHeaderProps {
  title: string;
  onClose: () => void;
}

export function PurpleModalHeader({ title, onClose }: PurpleModalHeaderProps) {
  return (
    <div className="sticky top-0 z-10 h-[130px] bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 px-6 pt-[50px] flex items-center justify-between">
      <h2 className="text-2xl font-semibold text-white">
        {title}
      </h2>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}
