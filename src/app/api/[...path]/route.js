import { NextResponse } from 'next/server';

const backendUrl = process.env.NEXT_PUBLIC_API_URL;

function buildBackendUrl(pathname, search = '') {
  const normalizedBase = backendUrl?.replace(/\/$/, '');
  if (!normalizedBase) {
    return null;
  }

  const normalizedPath = pathname.replace(/^\/+/, '');
  return new URL(`${normalizedBase}/api/${normalizedPath}${search}`);
}

async function proxyRequest(request, { params }) {
  const resolvedParams = await params;
  const path = Array.isArray(resolvedParams.path)
    ? resolvedParams.path.join('/')
    : resolvedParams.path;

  const targetUrl = buildBackendUrl(path, request.nextUrl.search);

  if (!targetUrl) {
    return NextResponse.json(
      { message: 'Server configuration error' },
      { status: 500 },
    );
  }

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('connection');
  headers.delete('content-length');

  const init = {
    method: request.method,
    headers,
    cache: 'no-store',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }

  const response = await fetch(targetUrl, init);

  return new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;