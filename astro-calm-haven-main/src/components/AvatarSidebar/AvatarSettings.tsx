import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Volume2, Globe } from 'lucide-react';

interface VoiceProfile {
  id: string;
  name: string;
  accent: string;
  gender: 'male' | 'female';
  description: string;
}

interface AvatarSettingsProps {
  voiceProfiles: VoiceProfile[];
  currentVoice: boolean;
  onToggleVoice: () => void;
  onSelectVoice: (profileId: string) => void;
  onClearChat: () => void;
}

export const AvatarSettings: React.FC<AvatarSettingsProps> = ({
  voiceProfiles,
  currentVoice,
  onToggleVoice,
  onSelectVoice,
  onClearChat
}) => {
  return (
    <div className="avatar-settings space-y-4">
      <Card className="p-4">
        <h4 className="font-semibold mb-4">Voice Settings</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="voice-enabled">Enable Voice</Label>
              <p className="text-sm text-muted-foreground">
                Turn voice responses on/off
              </p>
            </div>
            <Switch
              id="voice-enabled"
              checked={currentVoice}
              onCheckedChange={onToggleVoice}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice-profile">Voice Profile</Label>
            <Select onValueChange={onSelectVoice}>
              <SelectTrigger>
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {voiceProfiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    <div className="flex items-center">
                      <Volume2 size={16} className="mr-2" />
                      <div>
                        <div className="font-medium">{profile.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {profile.accent} • {profile.gender}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accent">Preferred Accent</Label>
            <div className="flex items-center space-x-2">
              <Globe size={16} />
              <span className="text-sm">Indian English</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold mb-4">Chat Settings</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="clear-chat">Clear Chat History</Label>
              <p className="text-sm text-muted-foreground">
                Delete all conversation history
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={onClearChat}
            >
              <Trash2 size={16} className="mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold mb-4">About Maitri AI</h4>
        <p className="text-sm text-muted-foreground">
          Maitri AI is your friendly Indian companion designed to chat with you like a friend.
          It can help you with memories, relaxation, and general conversation with a warm,
          familiar Indian accent.
        </p>
      </Card>
    </div>
  );
};