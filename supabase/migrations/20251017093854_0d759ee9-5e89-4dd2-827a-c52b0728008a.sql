-- Add new columns to pencairan table
ALTER TABLE pencairan
ADD COLUMN IF NOT EXISTS riil_pencairan numeric,
ADD COLUMN IF NOT EXISTS tgl_spp date,
ADD COLUMN IF NOT EXISTS tgl_sp2d date;

-- Add comment for clarity
COMMENT ON COLUMN pencairan.riil_pencairan IS 'Actual disbursement amount (can be different from nilai_pencairan)';
COMMENT ON COLUMN pencairan.tgl_spp IS 'Date of SPP (Surat Perintah Pembayaran)';
COMMENT ON COLUMN pencairan.tgl_sp2d IS 'Date of SP2D (Surat Perintah Pencairan Dana)';