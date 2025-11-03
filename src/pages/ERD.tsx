import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { useRef } from "react";
import jsPDF from "jspdf";

const ERD = () => {
  const erdRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a3'
    });

    // Add title
    pdf.setFontSize(20);
    pdf.text("Entity Relationship Diagram - Aplikasi Manajemen Kegiatan", 20, 20);

    // Add diagram description
    pdf.setFontSize(12);
    let yPos = 40;
    
    const entities = [
      { name: "profiles", desc: "Profil pengguna (id, email, full_name)" },
      { name: "user_roles", desc: "Role pengguna (user_id → profiles, role: admin/staf_keuangan/staf_biasa)" },
      { name: "pok", desc: "Petunjuk Operasional Kegiatan (user_id → profiles, kode_akun, nama_akun, jenis_akun, uraian, nilai_anggaran)" },
      { name: "kegiatan", desc: "Data kegiatan (user_id → profiles, nama, jenis_giat, tempat, waktu_mulai, waktu_selesai, id_pok → pok)" },
      { name: "non_kegiatan", desc: "Data non-kegiatan (user_id → profiles, nama_non_giat, jenis_non_giat, id_pok → pok)" },
      { name: "eviden", desc: "Bukti kegiatan (user_id → profiles, title, file_eviden, id_giat → kegiatan, id_non_giat → non_kegiatan, id_pok → pok, id_ref_eviden → ref_eviden)" },
      { name: "foto", desc: "Foto kegiatan (user_id → profiles, file_foto, id_giat → kegiatan)" },
      { name: "materi", desc: "Materi kegiatan (user_id → profiles, file_materi, id_giat → kegiatan)" },
      { name: "pencairan", desc: "Data pencairan (user_id → profiles, nilai_pencairan, tgl_pencairan, metode_pencairan, status_pencairan, id_pok → pok)" },
      { name: "ref_disposisi", desc: "Referensi disposisi (id, nama_disposisi)" },
      { name: "ref_eviden", desc: "Referensi jenis eviden (id, jenis_eviden)" }
    ];

    pdf.setFontSize(10);
    entities.forEach((entity) => {
      pdf.text(`• ${entity.name}:`, 20, yPos);
      pdf.setFontSize(9);
      pdf.text(`  ${entity.desc}`, 25, yPos + 5);
      pdf.setFontSize(10);
      yPos += 12;
      
      if (yPos > 180) {
        pdf.addPage();
        yPos = 20;
      }
    });

    // Add relationships section
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text("Hubungan Antar Tabel:", 20, 20);
    
    yPos = 35;
    pdf.setFontSize(10);
    const relationships = [
      "1. profiles ← user_roles (one-to-many)",
      "2. profiles ← pok (one-to-many)",
      "3. profiles ← kegiatan (one-to-many)",
      "4. profiles ← non_kegiatan (one-to-many)",
      "5. profiles ← eviden (one-to-many)",
      "6. profiles ← foto (one-to-many)",
      "7. profiles ← materi (one-to-many)",
      "8. profiles ← pencairan (one-to-many)",
      "9. pok ← kegiatan (one-to-many)",
      "10. pok ← non_kegiatan (one-to-many)",
      "11. pok ← eviden (one-to-many)",
      "12. pok ← pencairan (one-to-many)",
      "13. kegiatan ← foto (one-to-many)",
      "14. kegiatan ← materi (one-to-many)",
      "15. kegiatan ← eviden (one-to-many)",
      "16. kegiatan ← kegiatan (self-referencing: id_giat_sblm)",
      "17. non_kegiatan ← eviden (one-to-many)",
      "18. non_kegiatan ← non_kegiatan (self-referencing: id_non_giat_sblm)",
      "19. ref_eviden ← eviden (one-to-many)",
      "20. ref_disposisi (referenced by kegiatan.disposisi array)"
    ];

    relationships.forEach((rel) => {
      pdf.text(rel, 20, yPos);
      yPos += 8;
    });

    pdf.save("ERD-Aplikasi-Manajemen-Kegiatan.pdf");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Entity Relationship Diagram</h1>
          <p className="text-muted-foreground">Struktur database aplikasi manajemen kegiatan</p>
        </div>
        <Button onClick={downloadPDF} className="gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Database Schema</CardTitle>
          <CardDescription>Diagram hubungan antar tabel dalam database</CardDescription>
        </CardHeader>
        <CardContent>
          <div ref={erdRef} className="w-full overflow-x-auto">
            <div className="mermaid-container min-w-[800px]">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`erDiagram
    profiles ||--o{ user_roles : has
    profiles ||--o{ pok : owns
    profiles ||--o{ kegiatan : creates
    profiles ||--o{ non_kegiatan : creates
    profiles ||--o{ eviden : uploads
    profiles ||--o{ foto : uploads
    profiles ||--o{ materi : uploads
    profiles ||--o{ pencairan : manages
    
    pok ||--o{ kegiatan : "assigned to"
    pok ||--o{ non_kegiatan : "assigned to"
    pok ||--o{ eviden : "related to"
    pok ||--o{ pencairan : "for"
    
    kegiatan ||--o{ foto : contains
    kegiatan ||--o{ materi : contains
    kegiatan ||--o{ eviden : "has evidence"
    kegiatan ||--o{ kegiatan : "follows (id_giat_sblm)"
    
    non_kegiatan ||--o{ eviden : "has evidence"
    non_kegiatan ||--o{ non_kegiatan : "follows (id_non_giat_sblm)"
    
    ref_eviden ||--o{ eviden : categorizes
    ref_disposisi ||--o{ kegiatan : "referenced in"

    profiles {
        uuid id PK
        text email
        text full_name
        timestamp created_at
        timestamp updated_at
    }
    
    user_roles {
        uuid id PK
        uuid user_id FK
        app_role role
        timestamp created_at
    }
    
    pok {
        uuid id PK
        uuid user_id FK
        text kode_akun
        text nama_akun
        text jenis_akun
        text uraian
        numeric nilai_anggaran
        numeric harga
        text volume
        text satuan
        integer versi
        timestamp tanggal_versi
        timestamp created_at
        timestamp updated_at
    }
    
    kegiatan {
        uuid id PK
        uuid user_id FK
        uuid id_pok FK
        uuid id_giat_sblm FK
        text nama
        text jenis_giat
        text jenis_lokasi
        text tempat
        text agenda
        text penyelenggara
        text no_surat
        date tgl_surat
        timestamp waktu_mulai
        timestamp waktu_selesai
        text_array disposisi
        timestamp created_at
        timestamp updated_at
    }
    
    non_kegiatan {
        uuid id PK
        uuid user_id FK
        uuid id_pok FK
        uuid id_non_giat_sblm FK
        text nama_non_giat
        text jenis_non_giat
        timestamp created_at
        timestamp updated_at
    }
    
    eviden {
        uuid id PK
        uuid user_id FK
        uuid id_pok FK
        uuid id_giat FK
        uuid id_non_giat FK
        uuid id_ref_eviden FK
        text title
        text tipe_eviden
        text deskripsi
        text file_eviden
        integer tahun
        timestamp created_at
        timestamp updated_at
    }
    
    foto {
        uuid id PK
        uuid user_id FK
        uuid id_giat FK
        text file_foto
        timestamp created_at
    }
    
    materi {
        uuid id PK
        uuid user_id FK
        uuid id_giat FK
        text file_materi
        timestamp created_at
    }
    
    pencairan {
        uuid id PK
        uuid user_id FK
        uuid id_pok FK
        numeric nilai_pencairan
        numeric riil_pencairan
        date tgl_pencairan
        date tgl_spp
        date tgl_sp2d
        text metode_pencairan
        text status_pencairan
        timestamp created_at
        timestamp updated_at
    }
    
    ref_disposisi {
        uuid id PK
        text nama_disposisi
        timestamp created_at
    }
    
    ref_eviden {
        uuid id PK
        text jenis_eviden
        timestamp created_at
    }
`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tabel Utama</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>profiles:</strong> Data profil pengguna
            </div>
            <div>
              <strong>user_roles:</strong> Role/hak akses pengguna (admin, staf_keuangan, staf_biasa)
            </div>
            <div>
              <strong>pok:</strong> Petunjuk Operasional Kegiatan & anggaran
            </div>
            <div>
              <strong>kegiatan:</strong> Data kegiatan yang dilaksanakan
            </div>
            <div>
              <strong>non_kegiatan:</strong> Data aktivitas non-kegiatan
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tabel Pendukung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>eviden:</strong> Bukti/dokumen kegiatan
            </div>
            <div>
              <strong>foto:</strong> Foto dokumentasi kegiatan
            </div>
            <div>
              <strong>materi:</strong> Materi yang digunakan dalam kegiatan
            </div>
            <div>
              <strong>pencairan:</strong> Data pencairan dana
            </div>
            <div>
              <strong>ref_disposisi & ref_eviden:</strong> Tabel referensi
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ERD;