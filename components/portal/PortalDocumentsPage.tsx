"use client";

import { useEffect, useState } from "react";
import { Upload, FileText } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  fileSize?: number;
}

export default function PortalDocumentsPage() {
  const { t } = useTranslations();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadDocuments = () => {
    fetch("/api/portal/documents")
      .then((res) => res.json())
      .then((json) => setDocuments(json.documents || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);

    await fetch("/api/portal/documents", { method: "POST", body: formData });
    setUploading(false);
    loadDocuments();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading font-semibold text-charcoal">
          {t("portal.documents.title")}
        </h1>
        <label className="flex items-center gap-2 px-4 py-2 bg-gold text-charcoal font-body text-sm rounded-sm cursor-pointer hover:bg-gold/90">
          <Upload className="w-4 h-4" />
          {uploading ? t("common.submitting") : t("portal.documents.upload")}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <p className="font-body text-charcoal/60">{t("common.loading")}</p>
      ) : documents.length === 0 ? (
        <p className="font-body text-charcoal/60">{t("portal.documents.noDocuments")}</p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 bg-white border border-charcoal/10 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gold" />
                <div>
                  <p className="font-body text-charcoal">{doc.name}</p>
                  <p className="text-xs font-body text-charcoal/50">
                    {doc.type} · {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
