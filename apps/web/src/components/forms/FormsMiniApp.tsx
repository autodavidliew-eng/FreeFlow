'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';

import { CardPanel } from '../layout/CardPanel';

const FormioForm = dynamic(
  () => import('@formio/react').then((mod) => mod.Form),
  { ssr: false }
) as unknown as ComponentType<{
  form: Record<string, unknown>;
  onSubmit: (submission: Record<string, unknown>) => void | Promise<void>;
}>;

type LoadState = 'idle' | 'loading' | 'ready' | 'error' | 'submitting';

type FormsMiniAppProps = {
  formId: string;
};

export function FormsMiniApp({ formId }: FormsMiniAppProps) {
  const router = useRouter();
  const [schema, setSchema] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState<LoadState>('loading');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadSchema = async () => {
      setStatus('loading');
      setMessage(null);

      try {
        const response = await fetch(`/api/forms/${formId}/schema`, {
          method: 'GET',
          cache: 'no-store',
        });

        if (!active) {
          return;
        }

        if (response.status === 401) {
          router.replace('/auth/login');
          return;
        }

        if (response.status === 403) {
          setStatus('error');
          setMessage('Access denied');
          return;
        }

        if (!response.ok) {
          setStatus('error');
          setMessage('Unable to load form schema.');
          return;
        }

        const payload = (await response.json()) as Record<string, unknown>;
        setSchema(payload);
        setStatus('ready');
      } catch {
        if (!active) {
          return;
        }
        setStatus('error');
        setMessage('Unable to load form schema.');
      }
    };

    loadSchema();

    return () => {
      active = false;
    };
  }, [formId, router]);

  const handleSubmit = async (submission: Record<string, unknown>) => {
    setStatus('submitting');
    setMessage(null);

    const payload = submission?.data
      ? { data: submission.data }
      : (submission ?? {});

    try {
      const response = await fetch(`/api/forms/${formId}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        router.replace('/auth/login');
        return;
      }

      if (response.status === 403) {
        setStatus('error');
        setMessage('Access denied');
        return;
      }

      if (!response.ok) {
        setStatus('error');
        setMessage('Unable to submit form.');
        return;
      }

      setStatus('ready');
      setMessage('Submission received.');
    } catch {
      setStatus('error');
      setMessage('Unable to submit form.');
    }
  };

  const title =
    (schema && typeof schema.title === 'string' && schema.title) || formId;

  let body;

  if (status === 'loading') {
    body = <div className="ff-forms-loading">Loading form...</div>;
  } else if (!schema) {
    body = (
      <div className="ff-empty-state">
        No form schema is available for this request.
      </div>
    );
  } else {
    body = <FormioForm form={schema} onSubmit={handleSubmit} />;
  }

  return (
    <div className="ff-forms-shell">
      {message ? (
        <div
          className={`ff-form-message ${
            status === 'error' ? 'is-error' : 'is-success'
          }`}
        >
          {message}
        </div>
      ) : null}
      <CardPanel className="ff-form-panel" variant="soft">
        <div className="ff-form-header">
          <div>
            <div className="ff-form-title">{title}</div>
            <div className="ff-form-meta">Form ID: {formId}</div>
          </div>
          <div className="ff-form-status">
            {status === 'submitting' ? 'Submitting...' : 'Ready'}
          </div>
        </div>
        <div className="ff-form-body">{body}</div>
      </CardPanel>
    </div>
  );
}
