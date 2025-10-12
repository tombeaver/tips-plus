import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicy = ({ isOpen, onClose }: PrivacyPolicyProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none p-0 gap-0 border-0">
        {/* Fixed Header */}
        <div className="sticky top-0 z-10 h-[130px] bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 px-6 pt-[50px] flex items-center justify-between">
          <DialogTitle className="text-2xl font-semibold text-white">
            Privacy Policy
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
        <div className="overflow-y-auto flex-1 bg-background p-6">
          <div className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h3 className="font-semibold text-foreground mb-2">Information We Collect</h3>
            <p>
              We collect information you provide directly to us, including your tip entries, earnings data, 
              goals, and account information when you create an account and use our service.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-2">How We Use Your Information</h3>
            <p>
              We use your information to provide, maintain, and improve our tip tracking service, 
              including displaying your earnings data, generating analytics, and helping you track your goals.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-2">Data Storage and Security</h3>
            <p>
              Your data is securely stored using Supabase infrastructure with industry-standard encryption. 
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-2">Data Sharing</h3>
            <p>
              We do not sell, trade, or share your personal information with third parties. 
              Your tip and earnings data remains private and is only accessible to you.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-2">Your Rights</h3>
            <p>
              You have the right to access, update, or delete your personal information at any time. 
              You can manage your data through your account settings or by contacting us.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-2">Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy, please contact us through the app 
              or at the contact information provided in your app store listing.
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};