"use client";

import { use, useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/i18n";
import { formatDate } from "@/lib/utils";
import { Award, CheckCircle2, XCircle } from "lucide-react";

type VerifyResult = {
  valid: boolean;
  certificate: {
    certificate_code: string;
    issued_at: string;
    student_id?: string;
  } | null;
  courseTitle: string | null;
  studentName: string | null;
};

export default function CertificateVerifyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const { t } = useI18n();
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetch(`/api/data/certificates?code=${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data && typeof json.data === "object" && "valid" in json.data) {
          setResult(json.data as VerifyResult);
        } else {
          setResult({ valid: false, certificate: null, courseTitle: null, studentName: null });
        }
      })
      .catch(() => setResult({ valid: false, certificate: null, courseTitle: null, studentName: null }))
      .finally(() => setLoading(false));
  }, [code]);

  return (
    <PageLayout>
      <div className="nq-page-enter max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Award className="w-12 h-12 text-brand mx-auto mb-3" />
          <h1 className="font-display text-2xl font-bold text-text">
            {t("التحقق من الشهادة", "Certificate Verification")}
          </h1>
          <p className="text-sm text-text-secondary mt-2">{t("رمز الشهادة", "Certificate code")}: {code}</p>
        </div>

        {loading ? (
          <div className="nq-skeleton h-48 rounded-2xl" />
        ) : result?.valid && result.certificate ? (
          <Card>
            <div className="flex items-center gap-2 text-emerald-600 mb-4">
              <CheckCircle2 className="w-5 h-5" />
              <CardTitle className="font-display mb-0">{t("شهادة صالحة", "Valid certificate")}</CardTitle>
            </div>
            <div className="space-y-3 text-sm text-text-secondary">
              <p>
                <span className="text-text-muted">{t("الرمز:", "Code:")}</span>{" "}
                <span className="font-mono text-text">{result.certificate.certificate_code}</span>
              </p>
              {result.courseTitle && (
                <p>
                  <span className="text-text-muted">{t("الكورس:", "Course:")}</span>{" "}
                  <span className="text-text">{result.courseTitle}</span>
                </p>
              )}
              {result.studentName && (
                <p>
                  <span className="text-text-muted">{t("الطالب:", "Student:")}</span>{" "}
                  <span className="text-text">{result.studentName}</span>
                </p>
              )}
              <p>
                <span className="text-text-muted">{t("تاريخ الإصدار:", "Issued:")}</span>{" "}
                <span className="text-text">{formatDate(result.certificate.issued_at)}</span>
              </p>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <XCircle className="w-5 h-5" />
              <CardTitle className="font-display mb-0">{t("شهادة غير صالحة", "Invalid certificate")}</CardTitle>
            </div>
            <p className="text-sm text-text-secondary">
              {t(
                "لم نتمكن من العثور على شهادة بهذا الرمز.",
                "We could not find a certificate with this code."
              )}
            </p>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
