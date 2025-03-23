import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Document } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [documentToVerify, setDocumentToVerify] = useState<File | null>(null);
  const { toast } = useToast();
  
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents', searchTerm],
  });

  const verifyMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);
      
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || res.statusText);
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Document verified",
        description: `${data.name} has been successfully verified with hash: ${data.hash.substring(0, 15)}...`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setDocumentToVerify(null);
    },
    onError: (error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentToVerify(e.target.files[0]);
    }
  };

  const handleVerifyDocument = () => {
    if (documentToVerify) {
      verifyMutation.mutate(documentToVerify);
    } else {
      toast({
        title: "No document selected",
        description: "Please select a document to verify",
        variant: "destructive",
      });
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Document Verification</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <label 
            htmlFor="file-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <span className="material-icons -ml-1 mr-2 text-sm">cloud_upload</span>
            Upload Document
            <input 
              id="file-upload" 
              type="file" 
              className="sr-only" 
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </label>
        </div>
      </div>

      {documentToVerify && (
        <div className="mt-6 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Verify document</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Ready to verify the selected document on the blockchain</p>
            </div>
            <div className="mt-4 flex items-center">
              <span className="material-icons text-primary-600 mr-2">description</span>
              <span className="font-medium">{documentToVerify.name}</span>
              <span className="ml-2 text-sm text-gray-500">({Math.round(documentToVerify.size / 1024)} KB)</span>
            </div>
            <div className="mt-5 flex">
              <button
                type="button"
                disabled={verifyMutation.isPending}
                onClick={handleVerifyDocument}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {verifyMutation.isPending ? (
                  <span className="material-icons animate-spin mr-2">sync</span>
                ) : (
                  <span className="material-icons mr-2">verified</span>
                )}
                Verify on Blockchain
              </button>
              <button
                type="button"
                onClick={() => setDocumentToVerify(null)}
                className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="mb-4">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search Documents
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons text-gray-400">search</span>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search by name or hash..."
            />
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {isLoading ? (
              <li className="px-6 py-4 flex items-center justify-center">
                <span className="material-icons animate-spin mr-2">sync</span>
                Loading documents...
              </li>
            ) : documents && documents.length > 0 ? (
              documents.map((doc) => (
                <li key={doc.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="material-icons text-secondary-500 mr-2">
                          {doc.verified ? 'verified' : 'description'}
                        </span>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {doc.name}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        {doc.verified ? (
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Verified
                          </p>
                        ) : (
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <span className="material-icons text-xs mr-1">link</span>
                          <span className="font-mono truncate" style={{ maxWidth: '300px' }}>
                            {doc.hash}
                          </span>
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <span className="material-icons text-xs mr-1">schedule</span>
                        <p>
                          {doc.verified
                            ? `Verified on ${formatDate(doc.verifiedAt)}`
                            : `Uploaded on ${formatDate(doc.createdAt)}`}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex">
                      <a
                        href={`/documents/${doc.id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-900"
                      >
                        View details
                      </a>
                      <span className="mx-2 text-gray-500">|</span>
                      <button
                        type="button"
                        className="text-sm font-medium text-primary-600 hover:text-primary-900"
                        onClick={() => {
                          // Copy hash to clipboard
                          navigator.clipboard.writeText(doc.hash);
                          toast({
                            title: "Hash copied",
                            description: "Document hash has been copied to clipboard",
                          });
                        }}
                      >
                        Copy hash
                      </button>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-6 py-4 text-center text-gray-500">
                No documents found
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
