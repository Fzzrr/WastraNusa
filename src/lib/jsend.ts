import { NextResponse } from 'next/server';

interface JSendSuccess<T> {
  status: 'success';
  data: T | null;
}

interface JSendFail<T> {
  status: 'fail';
  data: T;
}

interface JSendError {
  status: 'error';
  message: string;
}

export type JSendResponse<T = unknown> =
  JSendSuccess<T> | JSendFail<T> | JSendError;

export const jsend = {
  success<T>(data: T | null = null, status = 200) {
    return NextResponse.json(
      {
        status: 'success',
        data,
      } as JSendSuccess<T>,
      { status },
    );
  },

  fail<T>(data: T, status = 400) {
    return NextResponse.json(
      {
        status: 'fail',
        data,
      } as JSendFail<T>,
      { status },
    );
  },

  error(message: string, status = 500) {
    return NextResponse.json(
      {
        status: 'error',
        message,
      } as JSendError,
      { status },
    );
  },
};
