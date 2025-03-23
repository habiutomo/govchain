import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Document } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DocumentVerification() {
  const [documentHash, setDocumentHash] = useState("");
  const { toast } = useToast();
  
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents/recent'],
  });

  const verifyMutation = useMutation({
    mutationFn: async (hash: string) => {
      const res = await apiRequest("POST", "/api/documents/verify", { hash });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Document verified",
        description: "The document has been successfully verified on the blockchain.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents/recent'] });
    },
    onError: (error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (documentHash.trim()) {
      verifyMutation.mutate(documentHash);
    } else {
      toast({
        title: "Input required",
        description: "Please enter a document hash to verify",
        variant: "destructive",
      });
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHrs < 1) {
      return "Just now";
    } else if (diffHrs === 1) {
      return "1 hour ago";
    } else if (diffHrs < 24) {
      return `${diffHrs} hours ago`;
    } else if (diffHrs < 48) {
      return "Yesterday";
    } else {
      return `${Math.floor(diffHrs / 24)} days ago`;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Document Verification</h3>
        <p className="mt-1 text-sm text-gray-500">
          Verify document authenticity using blockchain
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <form onSubmit={handleVerify}>
          <div className="mt-1 flex rounded-md shadow-sm">
            <div className="relative flex items-stretch flex-grow focus-within:z-10">
              <input
                type="text"
                name="document_hash"
                id="document_hash"
                value={documentHash}
                onChange={(e) => setDocumentHash(e.target.value)}
                className="focus:ring-primary focus:border-primary block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 pl-3"
                placeholder="Enter document hash or ID"
              />
            </div>
            <button
              type="submit"
              disabled={verifyMutation.isPending}
              className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              {verifyMutation.isPending ? (
                <span className="material-icons animate-spin text-gray-500">sync</span>
              ) : (
                <span className="material-icons text-gray-500">search</span>
              )}
              <span>Verify</span>
            </button>
          </div>
        </form>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Or upload a document</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <span className="material-icons text-gray-400 text-3xl">upload_file</span>
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PDF, DOC, JPEG up to 10MB</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 p-4 rounded-md border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">Recently Verified Documents</h4>
          {isLoading ? (
            <div className="py-4 flex justify-center">
              <span className="material-icons animate-spin">sync</span>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-gray-200">
              {documents && documents.map((doc) => (
                <li key={doc.id} className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="material-icons text-secondary-500 mr-2">check_circle</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">Verified {formatTimeAgo(doc.verifiedAt)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-primary-600 hover:text-primary-900"
                    onClick={() => window.open(`/documents/${doc.id}`, '_blank')}
                  >
                    View
                  </button>
                </li>
              ))}

              {documents && documents.length === 0 && (
                <li className="py-4 text-center text-sm text-gray-500">
                  No documents have been verified recently
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
