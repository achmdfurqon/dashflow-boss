-- Remove file_surat and file_laporan columns from kegiatan table
ALTER TABLE kegiatan DROP COLUMN IF EXISTS file_surat;
ALTER TABLE kegiatan DROP COLUMN IF EXISTS file_laporan;

-- Add tipe_eviden to eviden table
ALTER TABLE eviden ADD COLUMN IF NOT EXISTS tipe_eviden text;

-- Add id_pok to eviden table (optional)
ALTER TABLE eviden ADD COLUMN IF NOT EXISTS id_pok uuid REFERENCES pok(id);