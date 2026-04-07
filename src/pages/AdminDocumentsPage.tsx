import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, FileText, Trash2, Loader2, CheckCircle, AlertCircle, Shield } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PolicyDocument {
  id: string;
  title: string;
  file_path: string;
  is_active: boolean;
  created_at: string;
  extracted_text: string | null;
}

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    fullText += `\n--- Page ${i} ---\n${pageText}`;
  }

  return fullText.trim();
}

export default function AdminDocumentsPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (user && isAdmin) fetchDocuments();
  }, [user, isAdmin]);

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    const { data, error } = await supabase
      .from("policy_documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load documents");
    } else {
      setDocuments(data || []);
    }
    setIsLoadingDocs(false);
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      toast.error("Please provide a title and select a PDF file");
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are allowed");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    setIsUploading(true);

    try {
      // Extract text from PDF
      toast.info("Extracting text from PDF...");
      const extractedText = await extractTextFromPDF(selectedFile);

      if (!extractedText || extractedText.length < 10) {
        toast.error("Could not extract text from this PDF. It may be image-based or empty.");
        setIsUploading(false);
        return;
      }

      // Upload file to storage
      const filePath = `${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("policy-pdfs")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Save to database
      const { error: dbError } = await supabase
        .from("policy_documents")
        .insert({
          title: title.trim(),
          file_path: filePath,
          extracted_text: extractedText,
          uploaded_by: user!.id,
        });

      if (dbError) throw dbError;

      toast.success("Document uploaded and processed successfully!");
      setTitle("");
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById("pdf-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      fetchDocuments();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (doc: PolicyDocument) => {
    if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;

    try {
      // Delete from storage
      await supabase.storage.from("policy-pdfs").remove([doc.file_path]);

      // Delete from database
      const { error } = await supabase
        .from("policy_documents")
        .delete()
        .eq("id", doc.id);

      if (error) throw error;

      toast.success("Document deleted");
      fetchDocuments();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete document");
    }
  };

  const toggleActive = async (doc: PolicyDocument) => {
    const { error } = await supabase
      .from("policy_documents")
      .update({ is_active: !doc.is_active })
      .eq("id", doc.id);

    if (error) {
      toast.error("Failed to update document status");
    } else {
      toast.success(doc.is_active ? "Document deactivated" : "Document activated");
      fetchDocuments();
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Shield className="h-4 w-4" />
            Admin Panel
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Policy Documents</h1>
          <p className="text-muted-foreground">
            Upload PDF files to train the AI assistant. The assistant will answer questions based on the content of active documents.
          </p>
        </div>

        {/* Upload Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Document
            </CardTitle>
            <CardDescription>
              Upload a PDF policy document. Text will be extracted automatically for the AI assistant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Document Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Leave Policy 2024"
                  disabled={isUploading}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  PDF File
                </label>
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  disabled={isUploading}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
              </div>
              <Button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile || !title.trim()}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload & Process
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Uploaded Documents ({documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDocs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No documents uploaded yet.</p>
                <p className="text-sm">Upload your first PDF to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-background"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-medium text-foreground truncate">{doc.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString()} · {doc.extracted_text ? `${Math.round(doc.extracted_text.length / 4)} words` : "No text"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant={doc.is_active ? "outline" : "secondary"}
                        size="sm"
                        onClick={() => toggleActive(doc)}
                        title={doc.is_active ? "Click to deactivate" : "Click to activate"}
                      >
                        {doc.is_active ? (
                          <><CheckCircle className="h-4 w-4 text-green-600" /> Active</>
                        ) : (
                          <><AlertCircle className="h-4 w-4 text-muted-foreground" /> Inactive</>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
