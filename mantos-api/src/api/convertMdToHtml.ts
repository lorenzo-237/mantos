import { MD_TO_HTML_API_URL } from '@/config';

type ErrorMessage = {
  name: string;
  message: string;
  status: number;
};

function responseStatusOk(status: number): boolean {
  return status === 201 || status === 200;
}

export async function convertMarkdownToHtml(markdown: string): Promise<{ html: string }> {
  const dto = JSON.stringify({
    markdown: markdown === '' ? 'contenu vide' : markdown,
  });

  const response = await fetch(`${MD_TO_HTML_API_URL}/markdown/toHtml`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: dto,
  });

  if (!responseStatusOk(response.status)) {
    const error: ErrorMessage = (await response.json()) as ErrorMessage;
    console.log(error);
    throw error;
  }

  return response.json() as Promise<{ html: string }>;
}
