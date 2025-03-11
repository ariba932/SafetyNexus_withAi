import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { UserPlus, Mail, AlertCircle, Check, X } from "lucide-react";

interface TeamMember {
  id: string;
  user_id: string;
  company_id: string;
  role: string;
  created_at: string;
  is_active?: boolean;
  user_profile?: {
    full_name: string;
    email: string;
    avatar_url?: string;
    job_title?: string;
  };
}

interface InviteFormValues {
  email: string;
  role: string;
}

const inviteFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.string().min(1, { message: "Please select a role" }),
});

const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: "",
    },
  });

  useEffect(() => {
    const fetchUserAndCompany = async () => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        setCurrentUserId(user.id);

        // Get user's company
        const { data: companyMember, error: companyError } = await supabase
          .from("company_members")
          .select("company_id")
          .eq("user_id", user.id)
          .single();

        if (companyError) throw companyError;
        setCurrentCompanyId(companyMember.company_id);

        // Fetch team members
        await fetchTeamMembers(companyMember.company_id);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load team data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndCompany();
  }, []);

  const fetchTeamMembers = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from("company_members")
        .select(
          `
          *,
          user_profile:user_id(full_name, email, avatar_url, job_title)
        `,
        )
        .eq("company_id", companyId);

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      });
    }
  };

  const handleInvite = async (values: InviteFormValues) => {
    if (!currentCompanyId) return;

    setIsLoading(true);
    try {
      // Call Supabase Edge Function to handle invitation
      const { data, error } = await supabase.functions.invoke(
        "invite-team-member",
        {
          body: {
            email: values.email,
            role: values.role,
            companyId: currentCompanyId,
          },
        },
      );

      if (error) throw error;

      toast({
        title: "Invitation Sent",
        description: `Invitation email sent to ${values.email}`,
      });

      // Refresh team members list
      await fetchTeamMembers(currentCompanyId);
      form.reset();
      setInviteDialogOpen(false);
    } catch (error: any) {
      console.error("Error inviting team member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("company_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;

      // Update local state
      setTeamMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.id === memberId ? { ...member, role: newRole } : member,
        ),
      );

      toast({
        title: "Role Updated",
        description: "Team member role has been updated",
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (memberId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("company_members")
        .update({ is_active: isActive })
        .eq("id", memberId);

      if (error) throw error;

      // Update local state
      setTeamMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.id === memberId ? { ...member, is_active: isActive } : member,
        ),
      );

      toast({
        title: isActive ? "Member Activated" : "Member Deactivated",
        description: `Team member has been ${isActive ? "activated" : "deactivated"}`,
      });
    } catch (error) {
      console.error("Error toggling member status:", error);
      toast({
        title: "Error",
        description: "Failed to update member status",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Owner/Admin":
        return "default";
      case "Manager":
        return "secondary";
      case "Member":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Team Management</h1>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your company's team.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleInvite)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="colleague@company.com" {...field} />
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Owner/Admin">
                            Owner/Admin
                          </SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Invitation"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your team members and their access levels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading team members...</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No team members yet</h3>
              <p className="text-muted-foreground mt-2">
                Invite your colleagues to join your team.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.user_profile?.full_name || "Pending"}
                    </TableCell>
                    <TableCell>{member.user_profile?.email || "--"}</TableCell>
                    <TableCell>
                      {currentUserId !== member.user_id ? (
                        <Select
                          defaultValue={member.role}
                          onValueChange={(value) =>
                            handleRoleChange(member.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue>
                              <Badge variant={getRoleBadgeVariant(member.role)}>
                                {member.role}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Owner/Admin">
                              Owner/Admin
                            </SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Member">Member</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {member.user_profile ? (
                        <Badge
                          variant={
                            member.is_active === false
                              ? "destructive"
                              : "success"
                          }
                          className={
                            member.is_active === false
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {member.is_active === false ? "Inactive" : "Active"}
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {currentUserId !== member.user_id &&
                        member.user_profile && (
                          <div className="flex items-center justify-end space-x-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`active-${member.id}`}
                                checked={member.is_active !== false}
                                onCheckedChange={(checked) =>
                                  handleToggleActive(member.id, checked)
                                }
                              />
                              <Label htmlFor={`active-${member.id}`}>
                                {member.is_active === false
                                  ? "Disabled"
                                  : "Enabled"}
                              </Label>
                            </div>
                          </div>
                        )}
                      {!member.user_profile && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Resend invitation
                          }}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Resend
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamManagement;
