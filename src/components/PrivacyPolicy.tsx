import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicy = ({ isOpen, onClose }: PrivacyPolicyProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
};