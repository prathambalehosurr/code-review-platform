const LANGUAGE_MAP: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  java: 'java',
  go: 'go',
  cpp: 'cpp',
  c: 'c',
  cs: 'csharp',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  md: 'markdown',
  sql: 'sql',
};

/**
 * Detects the programming language of a file based on its extension.
 * Defaults to 'text' if the language is unknown or the file has no extension.
 */
export const detectLanguage = (filename: string): string => {
  const parts = filename.split('.');
  if (parts.length <= 1) {
    return 'text';
  }
  const extension = parts.pop()?.toLowerCase() || '';
  return LANGUAGE_MAP[extension] || 'text';
};
