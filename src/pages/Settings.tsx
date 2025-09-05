import { useState } from "react";
import { User, Trash2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

/**
 * User settings and account management
 */
export default function Settings() {
  const { toast } = useToast();
  const [user, setUser] = useState({
    id: "user1",
    handle: "mint-otter-42"
  });
  const [newHandle, setNewHandle] = useState(user.handle);

  const generateRandomHandle = () => {
    const adjectives = ["mint", "clever", "swift", "bright", "quiet", "bold", "zen", "cool"];
    const animals = ["otter", "fox", "wolf", "eagle", "deer", "lion", "bear", "hawk"];
    const number = Math.floor(Math.random() * 100);
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    
    return `${adjective}-${animal}-${number}`;
  };

  const handleGenerateHandle = () => {
    const randomHandle = generateRandomHandle();
    setNewHandle(randomHandle);
  };

  const handleSaveHandle = () => {
    if (newHandle.trim() === "") {
      toast({
        title: "Invalid handle",
        description: "Handle cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setUser(prev => ({ ...prev, handle: newHandle }));
    toast({
      title: "Handle updated",
      description: "Your new handle has been saved.",
    });
  };

  const handleDeleteAccount = () => {
    // In a real app, this would show a confirmation dialog
    toast({
      title: "Account deletion",
      description: "This feature will be available soon.",
      variant: "destructive",
    });
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
            <User className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground">Manage your anonymous profile</p>
          </div>
        </div>

        {/* Current Account */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Current Account</h2>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm font-mono">
                  {user.handle}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Anonymous ID: {user.id}
                </span>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Your account is anonymous and device-bound. All your activity is associated with your handle.</p>
            </div>
          </div>
        </Card>

        {/* Change Handle */}
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Change Handle</h2>
            
            <div className="space-y-3">
              <Label htmlFor="new-handle">New Handle</Label>
              <div className="flex gap-2">
                <Input
                  id="new-handle"
                  value={newHandle}
                  onChange={(e) => setNewHandle(e.target.value)}
                  placeholder="Enter new handle"
                  className="font-mono"
                />
                <Button variant="outline" onClick={handleGenerateHandle}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Choose a unique handle or generate a random one
              </p>
            </div>

            <Button onClick={handleSaveHandle} disabled={newHandle === user.handle}>
              Save Handle
            </Button>
          </div>
        </Card>

        {/* Privacy & Data */}
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Privacy & Data</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Public Profile</p>
                  <p className="text-sm text-muted-foreground">
                    Your schedules and comments are public by default
                  </p>
                </div>
                <Badge variant="outline">Always Public</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Data Collection</p>
                  <p className="text-sm text-muted-foreground">
                    We only collect necessary data to provide the service
                  </p>
                </div>
                <Badge variant="secondary">Minimal</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-destructive/20">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}