import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertUserSchema } from '@shared/schema';
import { Search, ShieldCheck, CheckCircle, Users, UserCheck, RefreshCw } from 'lucide-react';
import type { User } from '@shared/schema';

const identityFormSchema = insertUserSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Full name is required"),
  idNumber: z.string().min(4, "ID number is required"),
  identityType: z.enum(['Citizen ID', 'Government Official', 'Department Access', 'Contractor']),
  authorizationLevel: z.enum(['Citizen', 'Official', 'Admin', 'Contractor']),
});

type IdentityFormValues = z.infer<typeof identityFormSchema>;

export default function Identity() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  const { data: users, isLoading, refetch } = useQuery<User[]>({
    queryKey: ['/api/users', { search: searchTerm }],
  });
  
  const { data: selectedUser, isLoading: isLoadingSelectedUser } = useQuery<User>({
    queryKey: ['/api/users', selectedUserId],
    enabled: !!selectedUserId,
  });
  
  const form = useForm<IdentityFormValues>({
    resolver: zodResolver(identityFormSchema),
    defaultValues: {
      username: '',
      password: '',
      fullName: '',
      idNumber: '',
      department: '',
      identityType: 'Citizen ID',
      authorizationLevel: 'Citizen',
    }
  });
  
  const issueIdentityMutation = useMutation({
    mutationFn: async (values: IdentityFormValues) => {
      const response = await apiRequest('POST', '/api/users/create', values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Identity issued successfully",
        description: "The digital identity has been created and stored on the blockchain",
      });
      form.reset();
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Failed to issue identity",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const verifyIdentityMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('POST', `/api/users/${id}/verify`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Identity verified successfully",
        description: "The digital identity has been verified on the blockchain",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Failed to verify identity",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSearch = () => {
    refetch();
  };

  const onSubmit = (values: IdentityFormValues) => {
    issueIdentityMutation.mutate(values);
  };
  
  const verifyIdentity = (id: number) => {
    verifyIdentityMutation.mutate(id);
  };
  
  const formatDate = (dateString: Date | null | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Digital Identity Management</h2>
        <p className="text-slate-500 mt-1">Secure blockchain-based identity verification system</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Identity Registration Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Issue New Identity</CardTitle>
            <CardDescription>Create a digital identity secured on blockchain</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="identityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identity Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select identity type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Citizen ID">Citizen ID</SelectItem>
                          <SelectItem value="Government Official">Government Official</SelectItem>
                          <SelectItem value="Department Access">Department Access</SelectItem>
                          <SelectItem value="Contractor">Contractor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="idNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="authorizationLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authorization Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select authorization level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Citizen">Citizen</SelectItem>
                          <SelectItem value="Official">Official</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Contractor">Contractor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={issueIdentityMutation.isPending}
                >
                  {issueIdentityMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : "Issue Digital Identity"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Identity Details/Verification */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Identity Verification</CardTitle>
            <CardDescription>View and verify digital identities</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedUserId && selectedUser ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedUserId(null)}
                  >
                    Back to List
                  </Button>
                  
                  {!selectedUser.verified && (
                    <Button 
                      onClick={() => verifyIdentity(selectedUser.id)}
                      disabled={verifyIdentityMutation.isPending}
                    >
                      {verifyIdentityMutation.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                        </>
                      ) : "Verify Identity"}
                    </Button>
                  )}
                </div>
                
                <div className="mb-4 flex items-center space-x-3">
                  <div className={`h-10 w-10 rounded-full ${selectedUser.verified ? 'bg-green-100' : 'bg-yellow-100'} flex items-center justify-center`}>
                    {selectedUser.verified ? (
                      <CheckCircle className="text-green-600 h-5 w-5" />
                    ) : (
                      <RefreshCw className="text-yellow-600 h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Identity Status: {selectedUser.verified ? 'Verified' : 'Pending Verification'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Last verified: {formatDate(selectedUser.lastVerified)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Full Name</p>
                    <p className="text-sm">{selectedUser.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">ID Number</p>
                    <p className="text-sm">{selectedUser.idNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Department</p>
                    <p className="text-sm">{selectedUser.department || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Identity Type</p>
                    <p className="text-sm">{selectedUser.identityType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Authorization Level</p>
                    <p className="text-sm">
                      <Badge className="bg-primary-100 text-primary-700">
                        {selectedUser.authorizationLevel}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Username</p>
                    <p className="text-sm">{selectedUser.username}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-500">Identity Hash</p>
                  <p className="text-sm font-mono mt-1 bg-slate-50 p-2 rounded border border-slate-200 overflow-x-auto">
                    {selectedUser.identityHash}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between">
                  <div className="relative w-full md:w-64">
                    <Input 
                      type="text" 
                      placeholder="Search by name or ID..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pr-10"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-0 top-0 h-full px-3" 
                      onClick={handleSearch}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center items-center h-48">
                    <p className="text-slate-500">Loading identities...</p>
                  </div>
                ) : users && users.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>ID Number</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <div className={`h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-2`}>
                                  <UserCheck className="text-primary-600 h-4 w-4" />
                                </div>
                                <div>
                                  <div className="font-medium">{user.fullName}</div>
                                  <div className="text-xs text-slate-500">{user.department || 'No Department'}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{user.idNumber}</TableCell>
                            <TableCell>{user.identityType}</TableCell>
                            <TableCell>
                              <Badge variant={user.verified ? 'verified' : 'pending'}>
                                {user.verified ? 'Verified' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedUserId(user.id)}
                                >
                                  View
                                </Button>
                                {!user.verified && (
                                  <Button 
                                    size="sm"
                                    onClick={() => verifyIdentity(user.id)}
                                    disabled={verifyIdentityMutation.isPending}
                                  >
                                    Verify
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-10">
                    <Users className="h-10 w-10 text-slate-300 mb-2" />
                    <p className="text-slate-500">No identities found</p>
                    <p className="text-xs text-slate-400 mt-1">Create a new identity to get started</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Identity Verification Guide</CardTitle>
          <CardDescription>How digital identities are secured on the blockchain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                <Users className="text-primary-600 h-5 w-5" />
              </div>
              <h3 className="text-lg font-medium mb-2">Identity Creation</h3>
              <p className="text-sm text-slate-500">
                Digital identities are created with personal information and cryptographic keys. 
                Each identity receives a unique hash that serves as its identifier on the blockchain.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="h-10 w-10 bg-secondary-100 rounded-full flex items-center justify-center mb-3">
                <ShieldCheck className="text-secondary-600 h-5 w-5" />
              </div>
              <h3 className="text-lg font-medium mb-2">Blockchain Verification</h3>
              <p className="text-sm text-slate-500">
                Identity data is securely stored on the blockchain, making it tamper-proof and 
                transparent. Verification happens through cryptographic proofs recorded in blocks.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="text-green-600 h-5 w-5" />
              </div>
              <h3 className="text-lg font-medium mb-2">Secure Access</h3>
              <p className="text-sm text-slate-500">
                Verified identities grant secure access to government services and systems.
                Authorization levels determine what resources and data each identity can access.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
