
import React, { useState } from 'react';
import { useBoards } from '@/hooks/useBoards';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus, User, Users, Clock, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

const inviteFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  role: z.enum(['member', 'guest'], {
    required_error: 'Please select a role',
  }),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

export function BoardMembers({ boardId }: { boardId: string }) {
  const { useBoardMembers, useInviteMemberMutation } = useBoards();
  const { data: members, isLoading } = useBoardMembers(boardId);
  const inviteMutation = useInviteMemberMutation(boardId);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  const onSubmit = (data: InviteFormValues) => {
    inviteMutation.mutate({
      email: data.email,
      role: data.role,
    }, {
      onSuccess: () => {
        setInviteDialogOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast({
          title: "Invitation failed",
          description: error instanceof Error ? error.message : "Failed to send invitation",
          variant: "destructive"
        });
      }
    });
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'manager':
        return <Badge className="bg-blue-500">Manager</Badge>;
      case 'member':
        return <Badge className="bg-green-500">Member</Badge>;
      case 'guest':
        return <Badge className="bg-gray-500">Guest</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'accepted':
        return (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Accepted</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1 text-yellow-600">
            <AlertCircle className="h-4 w-4" />
            <span>Pending</span>
          </div>
        );
      case 'declined':
        return (
          <div className="flex items-center gap-1 text-red-600">
            <XCircle className="h-4 w-4" />
            <span>Declined</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Board Members</h3>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite to Board</DialogTitle>
              <DialogDescription>
                Invite someone to collaborate on this board.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="member">Member (can edit)</SelectItem>
                          <SelectItem value="guest">Guest (view only)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={inviteMutation.isPending}>
                    {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading members...</div>
      ) : members && members.length > 0 ? (
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium">{member.email}</p>
                  <div className="flex gap-2 mt-1">
                    {getRoleBadge(member.role)}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end text-xs">
                <div className="mb-1">
                  {getStatusBadge(member.invitation_status)}
                </div>
                <div className="text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(member.invited_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No members yet</p>
        </div>
      )}
    </div>
  );
}
