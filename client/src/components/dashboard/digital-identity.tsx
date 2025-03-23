import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
import { ShieldCheck } from 'lucide-react';

const identityFormSchema = insertUserSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Full name is required"),
  idNumber: z.string().min(4, "ID number is required"),
  identityType: z.enum(['Citizen ID', 'Government Official', 'Department Access', 'Contractor']),
  authorizationLevel: z.enum(['Citizen', 'Official', 'Admin', 'Contractor']),
});

type IdentityFormValues = z.infer<typeof identityFormSchema>;

export function DigitalIdentity() {
  const { toast } = useToast();
  const [activeIdentity, setActiveIdentity] = useState<any>(null);
  
  const { data: identityStatus, isLoading: statusLoading, refetch } = useQuery({
    queryKey: ['/api/users/status'],
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

  const onSubmit = (values: IdentityFormValues) => {
    issueIdentityMutation.mutate(values);
  };

  return (
    <Card>
      <div className="px-5 py-4 border-b border-slate-200">
        <h3 className="text-lg font-medium">Digital Identity Management</h3>
      </div>
      <CardContent className="p-5">
        <p className="text-sm text-slate-500 mb-5">
          Secure management of citizen and official digital identities using blockchain verification
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ID Verification Status */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b text-sm font-medium">
              ID Verification Status
            </div>
            <div className="p-4">
              {statusLoading ? (
                <div className="flex justify-center py-8">
                  <p className="text-slate-500">Loading identity status...</p>
                </div>
              ) : identityStatus ? (
                <>
                  <div className="mb-4 flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <ShieldCheck className="text-green-600 h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Identity Verification Active</p>
                      <p className="text-xs text-slate-500">
                        Last verified: {new Date(identityStatus.lastVerified).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Identity Document</span>
                      <Badge variant="verified">Verified</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Digital Signature</span>
                      <Badge variant="verified">Verified</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Biometric Data</span>
                      <Badge variant="verified">Verified</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Authorization Level</span>
                      <Badge variant="default" className="bg-primary-100 text-primary-700">
                        {identityStatus.authorizationLevel}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-xs text-slate-500">
                    Identity hash: <span className="font-mono">{identityStatus.identityHash}</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-slate-500">No active identity found</p>
                  <p className="text-xs text-slate-400 mt-2">Issue a new identity to get started</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Issue New Digital Identity */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b text-sm font-medium">
              Issue New Digital Identity
            </div>
            <div className="p-4">
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
                    {issueIdentityMutation.isPending ? "Processing..." : "Issue Digital Identity"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
