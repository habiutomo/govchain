import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { File, FileText, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Document } from '@shared/schema';

export function DocumentVerification() {
  const { toast } = useToast();
  const [documentHash, setDocumentHash] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { data: documents, isLoading, refetch } = useQuery<Document[]>({
    queryKey: ['/api/documents/recent'],
  });

  const verifyDocumentMutation = useMutation({
    mutationFn: async (hash: string) => {
      const response = await apiRequest('POST', '/api/documents/verify', { hash });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification successful",
        description: "The document has been verified on the blockchain",
      });
      setDocumentHash('');
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || response.statusText);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document uploaded",
        description: "The document has been uploaded and is pending verification",
      });
      setSelectedFile(null);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    uploadDocumentMutation.mutate(formData);
  };

  const handleVerifyHash = () => {
    if (!documentHash) {
      toast({
        title: "No hash provided",
        description: "Please enter a document hash to verify",
        variant: "destructive",
      });
      return;
    }
    
    verifyDocumentMutation.mutate(documentHash);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FilePdf className="text-red-500 mr-2 h-4 w-4" />;
      case 'xlsx':
      case 'xls':
        return <FileText className="text-green-500 mr-2 h-4 w-4" />;
      case 'docx':
      case 'doc':
        return <FileWord className="text-blue-500 mr-2 h-4 w-4" />;
      default:
        return <FileText className="text-slate-500 mr-2 h-4 w-4" />;
    }
  };

  return (
    <Card className="lg:col-span-3">
      <CardContent className="p-5">
        <h3 className="text-lg font-medium mb-4">Document Verification</h3>
        
        <div className="mb-5">
          <p className="text-sm text-slate-500 mb-4">Verify government documents using blockchain verification</p>
          
          <Label htmlFor="file-upload" className="block text-sm font-medium mb-1">Upload Document</Label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-8 w-8 text-slate-400" />
              <div className="flex text-sm text-slate-600">
                <label 
                  htmlFor="file-upload" 
                  className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-700"
                >
                  <span>Upload a file</span>
                  <input 
                    id="file-upload" 
                    name="file-upload" 
                    type="file" 
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-slate-500">
                {selectedFile ? selectedFile.name : "PDF, PNG, JPG up to 10MB"}
              </p>
              {selectedFile && (
                <Button 
                  size="sm" 
                  onClick={handleUpload}
                  disabled={uploadDocumentMutation.isPending}
                >
                  {uploadDocumentMutation.isPending ? "Uploading..." : "Upload"}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="document-hash" className="block text-sm font-medium mb-1">Enter Document Hash</Label>
          <div className="flex">
            <Input 
              id="document-hash"
              type="text" 
              placeholder="e.g., 0x8a2b...3f91" 
              className="rounded-r-none"
              value={documentHash}
              onChange={(e) => setDocumentHash(e.target.value)}
            />
            <Button 
              className="rounded-l-none"
              onClick={handleVerifyHash}
              disabled={verifyDocumentMutation.isPending}
            >
              {verifyDocumentMutation.isPending ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </div>
        
        <div className="mt-6 border-t border-slate-200 pt-4">
          <h4 className="text-sm font-medium text-slate-700 mb-2">Recent Documents</h4>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <p className="text-slate-500">Loading documents...</p>
            </div>
          ) : documents && documents.length > 0 ? (
            <ul className="space-y-3">
              {documents.map((document) => (
                <li key={document.id} className="flex items-center justify-between px-3 py-2 text-sm border border-slate-200 rounded-md">
                  <div className="flex items-center">
                    {getFileIcon(document.fileType)}
                    <span>{document.name}</span>
                  </div>
                  <Badge variant={document.status === 'verified' ? 'verified' : 'pending'}>
                    {document.status === 'verified' ? 'Verified' : 'Pending'}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex justify-center py-4">
              <p className="text-slate-500">No documents available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
