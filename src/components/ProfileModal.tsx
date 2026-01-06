import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Mail, Key, Trash2, Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { TipEntry } from "@/hooks/useTipEntries";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userCreatedAt: string;
  tipEntries: TipEntry[];
}

export function ProfileModal({ isOpen, onClose, userEmail, userCreatedAt, tipEntries }: ProfileModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetPassword = async () => {
    setIsResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) throw error;
      
      toast.success("A password reset link has been sent to your email. Please check your inbox and spam folder.", { duration: 6000 });
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Get the current session for the auth header
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No active session");
      }

      // Call the edge function to delete the account
      const { data, error } = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      toast.success("Your account has been permanently deleted.", { duration: 6000 });
      onClose();
    } catch (error: any) {
      console.error("Delete account error:", error);
      toast.error(error.message || "Failed to delete account");
      setIsDeleting(false);
    }
  };

  const totalShiftsLogged = tipEntries.length;
  const memberSince = userCreatedAt ? format(new Date(userCreatedAt), "MMMM d, yyyy") : "Unknown";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none p-0 gap-0 border-0 flex flex-col" hideCloseButton>
        {/* Header */}
        <div className="sticky top-0 z-10 h-[130px] bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 px-6 pt-[50px] flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Profile</h2>
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
        <div className="overflow-y-auto flex-1 bg-background p-6 space-y-6">
          {/* Account Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Account Details</h3>
            
            <div className="bg-card rounded-lg p-4 space-y-4 border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground font-medium">{userEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="text-foreground font-medium">{memberSince}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shifts Logged</p>
                  <p className="text-foreground font-medium">{totalShiftsLogged}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Account Actions</h3>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-14"
                onClick={handleResetPassword}
                disabled={isResetting}
              >
                <Key className="w-5 h-5 text-primary" />
                <span>{isResetting ? "Sending..." : "Reset Password"}</span>
              </Button>

              {!showDeleteConfirm ? (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-14 border-destructive/50 text-destructive hover:bg-destructive/10"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete Account</span>
                </Button>
              ) : (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">Delete your account?</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        This action cannot be undone. All your data will be permanently deleted.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="flex-1"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
