import { ButtonHTMLAttributes } from 'react';

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 ${props.className ?? ''}`}
    />
  );
}
