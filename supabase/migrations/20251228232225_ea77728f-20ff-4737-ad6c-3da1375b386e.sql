-- Make the interview-documents bucket public so recordings can be viewed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'interview-documents';