import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { UserTable, type User } from "@/components/UserTable";
import { UserModal } from "@/components/UserModal";
import { DeleteDialog } from "@/components/DeleteDialog";
import { SearchBar } from "@/components/SearchBar";
import { UserPlus } from "lucide-react";

const API_URL = "https://jsonplaceholder.typicode.com/users";

const Index = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const addUserMutation = useMutation({
    mutationFn: async (newUser: Partial<User>) => {
      const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(newUser),
        headers: {
          "Content-type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to add user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add user", variant: "destructive" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (updatedUser: Partial<User>) => {
      const response = await fetch(`${API_URL}/${updatedUser.id}`, {
        method: "PUT",
        body: JSON.stringify(updatedUser),
        headers: {
          "Content-type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to update user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`${API_URL}/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    },
  });

  const filteredUsers = users.filter((user: User) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.company.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddEdit = (userData: Partial<User>) => {
    if (selectedUser) {
      updateUserMutation.mutate(userData);
    } else {
      addUserMutation.mutate(userData);
    }
    setIsModalOpen(false);
    setSelectedUser(undefined);
  };

  const handleDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">User Management</h1>
        <div className="flex justify-between items-center gap-4">
          <div className="w-full max-w-sm">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <Button
            onClick={() => {
              setSelectedUser(undefined);
              setIsModalOpen(true);
            }}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <UserTable
          users={filteredUsers}
          isLoading={isLoading}
          onEdit={(user) => {
            setSelectedUser(user);
            setIsModalOpen(true);
          }}
          onDelete={(user) => {
            setUserToDelete(user);
            setIsDeleteDialogOpen(true);
          }}
        />
      </div>

      <UserModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(undefined);
        }}
        onSubmit={handleAddEdit}
      />

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Index;