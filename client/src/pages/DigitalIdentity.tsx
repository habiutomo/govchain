import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DigitalIdentity } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

const identitySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  identifier: z.string().min(5, "Identifier must be at least 5 characters"),
  organization: z.string().min(2, "Organization must be at least 2 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
});

type IdentityFormValues = z.infer<typeof identitySchema>;

export default function IdentityManagement() {
  const [selectedIdentity, setSelectedIdentity] = useState<DigitalIdentity | null>(null);
  const { toast } = useToast();
  
  const { data: identities, isLoading } = useQuery<DigitalIdentity[]>({
    queryKey: ['/api/digital-identities'],
  });

  const form = useForm<IdentityFormValues>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      name: "",
      identifier: "",
      organization: "",
      role: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: IdentityFormValues) => {
      const res = await apiRequest("POST", "/api/digital-identities", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Identity created",
        description: "The digital identity has been successfully created and added to the blockchain.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/digital-identities'] });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/digital-identities/${id}`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Identity revoked",
        description: "The digital identity has been successfully revoked.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/digital-identities'] });
      setSelectedIdentity(null);
    },
    onError: (error) => {
      toast({
        title: "Revocation failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: IdentityFormValues) => {
    createMutation.mutate(data);
  };

  const handleRevokeIdentity = (id: number) => {
    if (window.confirm("Are you sure you want to revoke this digital identity? This action cannot be undone.")) {
      revokeMutation.mutate(id);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Digital Identity Management</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={() => setSelectedIdentity(null)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <span className="material-icons -ml-1 mr-2 text-sm">add</span>
            New Digital Identity
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-12">
        {/* Identity list */}
        <div className={`${selectedIdentity ? 'md:col-span-7' : 'md:col-span-12'} bg-white shadow overflow-hidden sm:rounded-lg`}>
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Digital Identities</h3>
            <p className="mt-1 text-sm text-gray-500">
              Securely managed digital identities on the blockchain
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <span className="material-icons animate-spin mr-2">sync</span>
                      Loading digital identities...
                    </td>
                  </tr>
                ) : identities && identities.length > 0 ? (
                  identities.map((identity) => (
                    <tr 
                      key={identity.id} 
                      className={`${selectedIdentity?.id === identity.id ? 'bg-primary-50' : 'hover:bg-gray-50'}`}
                      onClick={() => setSelectedIdentity(identity)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="material-icons text-primary-600 text-sm">fingerprint</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{identity.name}</div>
                            <div className="text-xs text-gray-500 font-mono">{identity.identifier}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {identity.organization}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {identity.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${identity.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {identity.active ? 'Active' : 'Revoked'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(identity.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIdentity(identity);
                          }}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          View
                        </button>
                        {identity.active && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRevokeIdentity(identity.id);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No digital identities found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Identity details or create form */}
        {selectedIdentity ? (
          <div className="md:col-span-5 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Identity Details</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Blockchain-verified identity information
                </p>
              </div>
              <button
                onClick={() => setSelectedIdentity(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedIdentity.name}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Blockchain Identifier</dt>
                  <dd className="mt-1 text-sm font-mono text-gray-900">{selectedIdentity.identifier}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Organization</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedIdentity.organization}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedIdentity.role}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedIdentity.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedIdentity.active ? 'Active' : 'Revoked'}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedIdentity.createdAt)}</dd>
                </div>
                {selectedIdentity.revokedAt && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Revoked</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedIdentity.revokedAt)}</dd>
                  </div>
                )}
                <div className="sm:col-span-2 border-t border-gray-200 pt-4">
                  <dt className="text-sm font-medium text-gray-500">Blockchain Verification</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="material-icons text-secondary-500 mr-2">verified</span>
                      Verified on block #{selectedIdentity.blockNumber}
                    </div>
                    <div className="mt-2 text-xs font-mono text-gray-500 break-all">
                      <span>Transaction Hash: {selectedIdentity.transactionHash}</span>
                    </div>
                  </dd>
                </div>
                
                {selectedIdentity.active && (
                  <div className="sm:col-span-2 border-t border-gray-200 pt-4">
                    <button
                      type="button"
                      onClick={() => handleRevokeIdentity(selectedIdentity.id)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <span className="material-icons -ml-1 mr-2 text-sm">remove_circle_outline</span>
                      Revoke Identity
                    </button>
                  </div>
                )}
              </dl>
            </div>
          </div>
        ) : (
          <div className="md:col-span-5 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Digital Identity</h3>
              <p className="mt-1 text-sm text-gray-500">
                Register a new identity on the blockchain
              </p>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      {...form.register("name")}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                    {form.formState.errors.name && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">Unique Identifier</label>
                    <input
                      type="text"
                      id="identifier"
                      {...form.register("identifier")}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      placeholder="National ID, Employee ID, etc."
                    />
                    {form.formState.errors.identifier && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.identifier.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-gray-700">Organization</label>
                    <input
                      type="text"
                      id="organization"
                      {...form.register("organization")}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                    {form.formState.errors.organization && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.organization.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                    <input
                      type="text"
                      id="role"
                      {...form.register("role")}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                    {form.formState.errors.role && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.role.message}</p>
                    )}
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit"
                      disabled={createMutation.isPending}
                      className="w-full flex justify-center"
                    >
                      {createMutation.isPending ? (
                        <span className="material-icons animate-spin mr-2">sync</span>
                      ) : (
                        <span className="material-icons mr-2">add_circle_outline</span>
                      )}
                      Create Digital Identity
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
