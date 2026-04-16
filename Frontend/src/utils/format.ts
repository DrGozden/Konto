export function fmtRSD(amount: number): string {
  return new Intl.NumberFormat('sr-RS').format(amount) + ' RSD';
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('sr-RS');
}
