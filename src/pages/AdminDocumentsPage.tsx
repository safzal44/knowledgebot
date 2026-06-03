import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Upload, FileText, Trash2, Loader2, CheckCircle, AlertCircle, Shield,
  BarChart3, FolderTree, Plus, Sparkles,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

type Category = { id: string; name: string; description?: string | null };
interface PolicyDocument {
  id: string;
  title: string;
  file_path: string;
  is_active: boolean;
  created_at: string;
  extracted_text: string | null;
  program_id: string | null;
  department_id: string | null;
  document_type_id: string | null;
}
interface ChartRow {
  id: string;
  document_id: string;
  title: string;
  description: string | null;
  chart_type: "bar" | "pie" | "line";
  data: Array<{ label: string; value: number }>;
}

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--info))", "hsl(var(--success))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))"];

async function extractTextFromPDF(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let out = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    out += `\n--- Page ${i} ---\n` + content.items.map((it: any) => it.str).join(" ");
  }
  return out.trim();
}

function CategoryManager({ table, label }: { table: "programs" | "departments" | "document_types"; label: string }) {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from(table).select("*").order("name");
    if (error) toast.error(`Failed to load ${label}`);
    else setItems((data as any) || []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const payload: any = { name: name.trim() };
    if (table !== "document_types") payload.description = desc.trim() || null;
    const { error } = await supabase.from(table).insert(payload);
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success(`${label} added`); setName(""); setDesc(""); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{label}</CardTitle>
        <CardDescription>Manage the list of {label.toLowerCase()}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input placeholder={`New ${label.slice(0, -1).toLowerCase()} name`} value={name} onChange={(e) => setName(e.target.value)} />
          {table !== "document_types" && (
            <Input placeholder="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
          )}
          <Button onClick={add} disabled={loading || !name.trim()}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">None yet.</p>
          ) : items.map((it) => (
            <div key={it.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <div className="font-medium text-foreground">{it.name}</div>
                {it.description && <div className="text-xs text-muted-foreground">{it.description}</div>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(it.id)} className="text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ChartRenderer({ chart }: { chart: ChartRow }) {
  const data = chart.data || [];
  return (
    <div className="p-4 border border-border rounded-xl bg-background">
      <h4 className="font-semibold text-foreground">{chart.title}</h4>
      {chart.description && <p className="text-sm text-muted-foreground mb-3">{chart.description}</p>}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chart.chart_type === "pie" ? (
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={80} label>
                {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          ) : chart.chart_type === "line" ? (
            <LineChart data={data}>
              <XAxis dataKey="label" /><YAxis /><Tooltip />
              <Line type="monotone" dataKey="value" stroke={CHART_COLORS[0]} strokeWidth={2} />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <XAxis dataKey="label" /><YAxis /><Tooltip />
              <Bar dataKey="value" fill={CHART_COLORS[0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function AdminDocumentsPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [programs, setPrograms] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Category[]>([]);
  const [docTypes, setDocTypes] = useState<Category[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [programId, setProgramId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [docTypeId, setDocTypeId] = useState<string>("");
  const [filterProgram, setFilterProgram] = useState<string>("all");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [chartDoc, setChartDoc] = useState<PolicyDocument | null>(null);
  const [charts, setCharts] = useState<ChartRow[]>([]);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      fetchDocuments(); fetchCategories();
    }
  }, [user, isAdmin]);

  const fetchCategories = async () => {
    const [p, d, t] = await Promise.all([
      supabase.from("programs").select("*").order("name"),
      supabase.from("departments").select("*").order("name"),
      supabase.from("document_types").select("*").order("name"),
    ]);
    setPrograms((p.data as any) || []);
    setDepartments((d.data as any) || []);
    setDocTypes((t.data as any) || []);
  };

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    const { data, error } = await supabase
      .from("policy_documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load documents");
    else setDocuments((data as any) || []);
    setIsLoadingDocs(false);
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      toast.error("Provide a title and PDF file"); return;
    }
    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files allowed"); return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB"); return;
    }
    setIsUploading(true);
    try {
      toast.info("Extracting text from PDF...");
      const extractedText = await extractTextFromPDF(selectedFile);
      if (!extractedText || extractedText.length < 10) {
        toast.error("Could not extract text from this PDF.");
        setIsUploading(false); return;
      }
      const filePath = `${Date.now()}-${selectedFile.name}`;
      const { error: upErr } = await supabase.storage.from("policy-pdfs").upload(filePath, selectedFile);
      if (upErr) throw upErr;
      const { error: dbErr } = await supabase.from("policy_documents").insert({
        title: title.trim(),
        file_path: filePath,
        extracted_text: extractedText,
        uploaded_by: user!.id,
        program_id: programId || null,
        department_id: departmentId || null,
        document_type_id: docTypeId || null,
      });
      if (dbErr) throw dbErr;
      toast.success("Document uploaded!");
      setTitle(""); setSelectedFile(null);
      setProgramId(""); setDepartmentId(""); setDocTypeId("");
      const fi = document.getElementById("pdf-upload") as HTMLInputElement;
      if (fi) fi.value = "";
      fetchDocuments();
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (doc: PolicyDocument) => {
    if (!confirm(`Delete "${doc.title}"?`)) return;
    await supabase.storage.from("policy-pdfs").remove([doc.file_path]);
    const { error } = await supabase.from("policy_documents").delete().eq("id", doc.id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); fetchDocuments(); }
  };

  const toggleActive = async (doc: PolicyDocument) => {
    const { error } = await supabase.from("policy_documents").update({ is_active: !doc.is_active }).eq("id", doc.id);
    if (error) toast.error("Update failed");
    else { toast.success(doc.is_active ? "Deactivated" : "Activated"); fetchDocuments(); }
  };

  const openCharts = async (doc: PolicyDocument) => {
    setChartDoc(doc); setChartsLoading(true); setCharts([]);
    const { data, error } = await supabase
      .from("document_charts").select("*").eq("document_id", doc.id).order("created_at");
    if (error) toast.error("Failed to load charts");
    else setCharts((data as any) || []);
    setChartsLoading(false);
  };

  const generateCharts = async () => {
    if (!chartDoc) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-document-charts", {
        body: { document_id: chartDoc.id },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success(`Generated ${(data as any)?.count ?? 0} chart(s)`);
      openCharts(chartDoc);
    } catch (e: any) {
      toast.error(e.message || "Chart generation failed");
    } finally {
      setGenerating(false);
    }
  };

  if (authLoading) {
    return <Layout><div className="flex items-center justify-center h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const nameOf = (list: Category[], id: string | null) => list.find((x) => x.id === id)?.name;
  const filteredDocs = documents.filter((d) =>
    (filterProgram === "all" || d.program_id === filterProgram) &&
    (filterDept === "all" || d.department_id === filterDept)
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Shield className="h-4 w-4" /> Admin Panel
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Knowledge Base</h1>
          <p className="text-muted-foreground">Upload PDFs by program & department, and generate AI-powered charts from their content.</p>
        </div>

        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="documents"><FileText className="h-4 w-4 mr-1" /> Documents</TabsTrigger>
            <TabsTrigger value="categories"><FolderTree className="h-4 w-4 mr-1" /> Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-8 mt-6">
            {/* Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Upload Document</CardTitle>
                <CardDescription>Categorize each PDF by program, department, and type.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title" disabled={isUploading} />
                <div className="grid sm:grid-cols-3 gap-3">
                  <Select value={programId} onValueChange={setProgramId}>
                    <SelectTrigger><SelectValue placeholder="Program" /></SelectTrigger>
                    <SelectContent>
                      {programs.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={departmentId} onValueChange={setDepartmentId}>
                    <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={docTypeId} onValueChange={setDocTypeId}>
                    <SelectTrigger><SelectValue placeholder="Document type" /></SelectTrigger>
                    <SelectContent>
                      {docTypes.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <input
                  id="pdf-upload" type="file" accept=".pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  disabled={isUploading}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
                <Button onClick={handleUpload} disabled={isUploading || !selectedFile || !title.trim()} className="w-full">
                  {isUploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : <><Upload className="h-4 w-4" /> Upload & Process</>}
                </Button>
              </CardContent>
            </Card>

            {/* Filter + List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Documents ({filteredDocs.length})</CardTitle>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Select value={filterProgram} onValueChange={setFilterProgram}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All programs</SelectItem>
                      {programs.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filterDept} onValueChange={setFilterDept}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All departments</SelectItem>
                      {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingDocs ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : filteredDocs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No documents match these filters.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredDocs.map((doc) => (
                      <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-background">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <FileText className="h-8 w-8 text-primary flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <h3 className="font-medium text-foreground truncate">{doc.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {nameOf(programs, doc.program_id) && <Badge variant="secondary">{nameOf(programs, doc.program_id)}</Badge>}
                              {nameOf(departments, doc.department_id) && <Badge variant="outline">{nameOf(departments, doc.department_id)}</Badge>}
                              {nameOf(docTypes, doc.document_type_id) && <Badge>{nameOf(docTypes, doc.document_type_id)}</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button variant="outline" size="sm" onClick={() => openCharts(doc)}>
                            <BarChart3 className="h-4 w-4" /> Charts
                          </Button>
                          <Button variant={doc.is_active ? "outline" : "secondary"} size="sm" onClick={() => toggleActive(doc)}>
                            {doc.is_active
                              ? <><CheckCircle className="h-4 w-4 text-primary" /> Active</>
                              : <><AlertCircle className="h-4 w-4 text-muted-foreground" /> Inactive</>}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(doc)} className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="grid md:grid-cols-2 gap-4 mt-6">
            <CategoryManager table="programs" label="Programs" />
            <CategoryManager table="departments" label="Departments" />
            <CategoryManager table="document_types" label="Document Types" />
          </TabsContent>
        </Tabs>

        {/* Charts Dialog */}
        <Dialog open={!!chartDoc} onOpenChange={(o) => !o && setChartDoc(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                AI Charts — {chartDoc?.title}
              </DialogTitle>
              <DialogDescription>
                Visualizations generated by AI from the PDF's content.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Button onClick={generateCharts} disabled={generating} className="w-full">
                {generating
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating with AI...</>
                  : <><Sparkles className="h-4 w-4" /> {charts.length > 0 ? "Regenerate Charts" : "Generate Charts"}</>}
              </Button>

              {chartsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : charts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No charts yet. Click "Generate Charts" to extract quantitative data from the PDF.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {charts.map((c) => <ChartRenderer key={c.id} chart={c} />)}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
