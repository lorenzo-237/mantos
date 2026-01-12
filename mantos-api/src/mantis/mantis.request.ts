import { MANTIS_API_URL } from '@/config';
import { HttpException } from '@/exceptions/httpException';

export async function mantisGET<T>(slug: string, mantisToken: string): Promise<T> {
  const requestOptions: RequestInit = {
    method: 'GET',

    headers: {
      'Content-Type': 'application/json',
      Authorization: mantisToken,
    },
    redirect: 'follow',
  };

  const requestUrl = `${MANTIS_API_URL}${slug}`;

  try {
    const response = await fetch(requestUrl, requestOptions);

    if (response.status !== 200) {
      throw new HttpException(response.status, response.statusText);
    }

    return response.json() as T;
  } catch (error) {
    throw error;
  }
}

export async function mantisPOST<T>(slug: string, body: any, mantisToken: string, expectedStatus: number = 201): Promise<T> {
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: mantisToken,
    },
    redirect: 'follow',
    body: JSON.stringify(body),
  };

  const requestUrl = `${MANTIS_API_URL}${slug}`;

  try {
    const response = await fetch(requestUrl, requestOptions);

    if (response.status !== 200 && response.status !== expectedStatus) {
      throw new HttpException(response.status, response.statusText);
    }

    return response.json() as T;
  } catch (error) {
    throw error;
  }
}

export async function mantisPOST_Bis(slug: string, body: any, mantisToken: string, expectedStatus: number = 201) {
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: mantisToken,
    },
    redirect: 'follow',
    body: JSON.stringify(body),
  };

  const requestUrl = `${MANTIS_API_URL}${slug}`;

  try {
    const response = await fetch(requestUrl, requestOptions);

    if (response.status !== 200 && response.status !== expectedStatus) {
      throw new HttpException(response.status, response.statusText);
    }
  } catch (error) {
    throw error;
  }
}

export async function mantisPATCH<T>(slug: string, body: any, mantisToken: string, expectedStatus: number = 200): Promise<T> {
  const requestOptions: RequestInit = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: mantisToken,
    },
    redirect: 'follow',
    body: JSON.stringify(body),
  };

  const requestUrl = `${MANTIS_API_URL}${slug}`;

  try {
    const response = await fetch(requestUrl, requestOptions);

    if (response.status !== 200 && response.status !== expectedStatus) {
      throw new HttpException(response.status, response.statusText);
    }

    return response.json() as T;
  } catch (error) {
    throw error;
  }
}

export async function mantisPOST_NoContent(
  slug: string,
  body: any,
  mantisToken: string,
  expectedStatus: number = 204,
): Promise<{ status: number; message: string }> {
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: mantisToken,
    },
    redirect: 'follow',
    body: JSON.stringify(body),
  };

  const requestUrl = `${MANTIS_API_URL}${slug}`;

  try {
    const response = await fetch(requestUrl, requestOptions);

    if (response.status !== 200 && response.status !== expectedStatus) {
      throw new HttpException(response.status, response.statusText);
    }

    return {
      status: response.status,
      message: response.statusText,
    };
  } catch (error) {
    throw error;
  }
}
